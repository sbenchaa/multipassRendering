/* ### OrthoViewpoint ### */
x3dom.registerNodeType(
        "OrthoViewpoint",
        "Navigation",
        defineClass(x3dom.nodeTypes.X3DViewpointNode,
                function (ctx) {
                    x3dom.nodeTypes.OrthoViewpoint.superClass.call(this, ctx);


                    this.addField_MFFloat(ctx, 'fieldOfView', [-1.0,-1.0,1.0,1.0]);
                    this.addField_SFVec3f(ctx, 'position', 0, 0, 10);
					this.addField_SFVec3f(ctx, 'lookAt', 0, 0, 0);
                    this.addField_SFRotation(ctx, 'orientation', 0, 0, 1, 0);
                    this.addField_SFVec3f(ctx, 'centerOfRotation', 0, 0, 0);
                    this.addField_SFFloat(ctx, 'zNear', 0.1);
                    this.addField_SFFloat(ctx, 'zFar', 100000);

                    this._viewMatrix = this._vf.orientation.toMatrix().transpose().
                            mult(x3dom.fields.SFMatrix4f.translation(this._vf.position.negate()));
                    this._projMatrix = null;
                    this._lastAspect = 1.0;
                    this.upVector=new x3dom.fields.SFVec3f(0, 1, 0);
					this.lookAtPosition();

                },
        {
            fieldChanged: function (fieldName) {

                if (fieldName == "position" || fieldName == "orientation") {
                    this._viewMatrix = this._vf.orientation.toMatrix().transpose().
                            mult(x3dom.fields.SFMatrix4f.translation(this._vf.position.negate()));
                }
                else if (fieldName == "fieldOfView" ||
                        fieldName == "zNear" || fieldName == "zFar") {
                    this._projMatrix = null;   // only trigger refresh
                }
                else if (fieldName === "set_bind") {
                    // XXX FIXME; call parent.fieldChanged();
                    this.bind(this._vf.set_bind);
                }
            },

            activate: function (prev) {
                if (prev) {
                    this._nameSpace.doc._viewarea.animateTo(this, prev);
                }
                x3dom.nodeTypes.X3DViewpointNode.prototype.activate.call(this,prev);
                this._nameSpace.doc._viewarea._needNavigationMatrixUpdate = true;
                //x3dom.debug.logInfo ('activate ViewBindable ' + this._DEF);
            },

            deactivate: function (prev) {
                x3dom.nodeTypes.X3DViewpointNode.prototype.deactivate.call(this,prev);
                //x3dom.debug.logInfo ('deactivate ViewBindable ' + this._DEF);
            },

            getCenterOfRotation: function() {
                return this._vf.centerOfRotation;
            },
            getViewMatrix: function() {
                return this._viewMatrix;
            },
            getFieldOfView: function() {
                return this._vf.fieldOfView;
            },
            setFieldOfView: function(fov) {
                this._vf.fieldOfView = fov;
                this._projMatrix = null;
            },
            setView: function(newView) {
                var mat = this.getCurrentTransform();
                mat = mat.inverse();
                this._viewMatrix = mat.mult(newView);
            },
            lookAtPosition: function() {
				q=new x3dom.fields.Quaternion();
				q.setValue(x3dom.fields.SFMatrix4f.lookAt(this._vf.position,this._vf.lookAt, this.upVector));
				this._vf.orientation = q;
				this.resetView();
			},
            resetView: function() {
                this._viewMatrix = this._vf.orientation.toMatrix().transpose().
                        mult(x3dom.fields.SFMatrix4f.translation(this._vf.position.negate()));
            },

            getProjectionMatrix: function(aspect)
            {
                if (this._projMatrix == null)
                {
                    var far = this._vf.zFar;
                    var near = this._vf.zNear;
                    var left = this._vf.fieldOfView[0];
                    var right = this._vf.fieldOfView[2];
                    var bottom = this._vf.fieldOfView[1];
                    var top = this._vf.fieldOfView[3];

                    var rl = (right - left);
                    var tb = (top - bottom);
                    var fn = (far - near);

                    this._projMatrix = new x3dom.fields.SFMatrix4f(
                            2 / rl, 0, 0, -(right+left) / rl,
                            0, 2 / tb, 0, -(top+bottom) / tb,
                            0, 0, -2 / fn, -(far+near) / fn,
                            0, 0, 0, 1
                            );

                    // this._lastAspect = aspect;
                }
                /*else if (this._lastAspect !== aspect)
                 {
                 this._projMatrix._00 = (1 / Math.tan(this._vf.fieldOfView / 2)) / aspect;
                 this._lastAspect = aspect;
                 }*/

                return this._projMatrix;
            }
        }
    )
);


/* ### Viewpoint ### */
x3dom.registerNodeType(
    "Viewpoint",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DViewpointNode,
        function (ctx) {
            x3dom.nodeTypes.Viewpoint.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'fieldOfView', 0.785398);
            this.addField_SFVec3f(ctx, 'position', 0, 0, 10);
            this.addField_SFVec3f(ctx, 'lookAt', 0, 0, 0);
            this.addField_SFRotation(ctx, 'orientation', 0, 0, 0, 1);
            this.addField_SFVec3f(ctx, 'centerOfRotation', 0, 0, 0);
            this.addField_SFFloat(ctx, 'zNear', -1); //0.1);
            this.addField_SFFloat(ctx, 'zFar', -1);  //100000);


            //this._viewMatrix = this._vf.orientation.toMatrix().transpose().
            //    mult(x3dom.fields.SFMatrix4f.translation(this._vf.position.negate()));
            this._viewMatrix = x3dom.fields.SFMatrix4f.translation(this._vf.position).
                mult(this._vf.orientation.toMatrix()).inverse();

            this._projMatrix = null;
            this._lastAspect = 1.0;
            // z-ratio: a value around 5000 would be better...
            this._zRatio = 10000;
            this._zNear = this._vf.zNear;
            this._zFar = this._vf.zFar;
            this.upVector=new x3dom.fields.SFVec3f(0, 1, 0);
			this.lookAtPosition();
        },
        {
            fieldChanged: function (fieldName) {
				if(fieldName == "lookAt")
					this.lookAtPosition();
                if (fieldName == "position" || 
					fieldName == "orientation") {
                    this.resetView();
                }
                else if (fieldName == "fieldOfView" ||
                         fieldName == "zNear" || 
						 fieldName == "zFar") {
                    this._projMatrix = null;   // only trigger refresh
                    this._zNear = this._vf.zNear;
                    this._zFar = this._vf.zFar;
                }
                else if (fieldName.indexOf("bind") >= 0) {
                    // FIXME; call parent.fieldChanged();
                    this.bind(this._vf.bind);
                }
            },

            activate: function (prev) {
                if (prev) {
                    this._nameSpace.doc._viewarea.animateTo(this, prev);
                }
                x3dom.nodeTypes.X3DViewpointNode.prototype.activate.call(this,prev);
                this._nameSpace.doc._viewarea._needNavigationMatrixUpdate = true;
                //x3dom.debug.logInfo ('activate ViewBindable ' + this._DEF);
            },

            deactivate: function (prev) {
                x3dom.nodeTypes.X3DViewpointNode.prototype.deactivate.call(this,prev);
                //x3dom.debug.logInfo ('deactivate ViewBindable ' + this._DEF);
            },

            getCenterOfRotation: function() {
                return this._vf.centerOfRotation;
            },
            
            getViewMatrix: function() {
                return this._viewMatrix;
            },
            
            getFieldOfView: function() {
                return this._vf.fieldOfView;
            },

            setView: function(newView) {
                var mat = this.getCurrentTransform();
                mat = mat.inverse();
                this._viewMatrix = mat.mult(newView);
            },
            lookAtPosition: function() {
				q=new x3dom.fields.Quaternion();
				q.setValue(x3dom.fields.SFMatrix4f.lookAt(this._vf.position,this._vf.lookAt, this.upVector));
				this._vf.orientation = q;
				this.resetView();
			},
            resetView: function() {
                //this._viewMatrix = this._vf.orientation.toMatrix().transpose().
                //    mult(x3dom.fields.SFMatrix4f.translation(this._vf.position.negate()));
                this._viewMatrix = x3dom.fields.SFMatrix4f.translation(this._vf.position).
                    mult(this._vf.orientation.toMatrix()).inverse();
            },

            getTransformation: function() {
                return this.getCurrentTransform();
            },
            
            getNear: function() {
                return this._zNear;
            },
            
            getFar: function() {
                return this._zFar;
            },

            getProjectionMatrix: function(aspect)
            {
                var fovy = this._vf.fieldOfView;
                var zfar = this._vf.zFar;
                var znear = this._vf.zNear;

                if (znear <= 0 || zfar <= 0)
                {
                    var nearScale = 0.8, farScale = 1.2;
                    var viewarea = this._nameSpace.doc._viewarea;
                    
                    var min = new x3dom.fields.SFVec3f();
                    min.setValues(viewarea._scene._lastMin);
                    
                    var max = new x3dom.fields.SFVec3f();
                    max.setValues(viewarea._scene._lastMax);
                    
                    var dia = max.subtract(min);
                    var sRad = dia.length() / 2;
                    
                    var mat = viewarea.getViewMatrix().inverse();
                    var vp = mat.e3();

                    var sCenter = min.add(dia.multiply(0.5));
                    var vDist = (vp.subtract(sCenter)).length();
                    
                    if (sRad) {
                        if (vDist > sRad)
                            znear = (vDist - sRad) * nearScale;  // Camera outside scene
                        else
                            znear = 0;                           // Camera inside scene
                        
                        zfar = (vDist + sRad) * farScale;
                    }
                    else {
                        znear = 0.1;
                        zfar = 100000;
                    }
                    
                    var zNearLimit = zfar / this._zRatio;
                    znear = Math.max(znear, Math.max(x3dom.fields.Eps, zNearLimit));
                    //x3dom.debug.logInfo("near: " + znear + " -> far:" + zfar);
                    
                    if (this._vf.zFar > 0)
                        zfar = this._vf.zFar;
                    if (this._vf.zNear > 0)
                        znear = this._vf.zNear;
                    
                    var div = znear - zfar;
                    
                    if (this._projMatrix != null && div != 0)
                    {
                        this._projMatrix._22 = (znear + zfar) / div;
                        this._projMatrix._23 = 2 * znear * zfar / div;
                    }
                }
                
                // needed for being able to ask for near and far
                this._zNear = znear;
                this._zFar = zfar;

                if (this._projMatrix == null)
                {
                    var f = 1 / Math.tan(fovy / 2);
                    
                    this._projMatrix = new x3dom.fields.SFMatrix4f(
                        f/aspect, 0, 0, 0,
                        0, f, 0, 0,
                        0, 0, (znear+zfar)/(znear-zfar), 2*znear*zfar/(znear-zfar),
                        0, 0, -1, 0
                    );

                    this._lastAspect = aspect;
                }
                else if (this._lastAspect !== aspect)
                {
                    this._projMatrix._00 = (1 / Math.tan(fovy / 2)) / aspect;
                    this._lastAspect = aspect;
                }

                return this._projMatrix;
            }
        }
    )
);
/* 
 * Sphere2
 * Possibility to create an hemispherical geometry
 * 
 */
x3dom.registerNodeType(
    "Sphere2",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Sphere.superClass.call(this, ctx);

            // sky box background creates sphere with r = 10000
			this.addField_SFFloat(ctx, 'radius', ctx ? 1 : 10000);
			this.addField_SFVec2f(ctx, 'subdivision', 24, 24);
			this.addField_SFBool(ctx, 'hemi', false);
			
            var qfactor = 1.0;
			var r = this._vf.radius;
			var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
			
			var geoCacheID = 'Sphere_'+r;

			if (x3dom.geoCache[geoCacheID] !== undefined) {
				//x3dom.debug.logInfo("Using Sphere from Cache");
				this._mesh = x3dom.geoCache[geoCacheID];
			} else {
				if(ctx) {
					qfactor = ctx.doc.properties.getProperty("PrimitiveQuality", "Medium");
				}
                if (!x3dom.isNumber(qfactor)) {
                    switch (qfactor.toLowerCase()) {
                        case "low":
                            qfactor = 0.3;
                            break;
                        case "medium":
                            qfactor = 0.5;
                            break;
                        case "high":
                            qfactor = 1.0;
                            break;
                    }
                } else {
                    qfactor = parseFloat(qfactor);
                }
				
				this._quality = qfactor;

				var latNumber, longNumber;
				var latitudeBands = Math.floor(subx * qfactor);
				var longitudeBands = Math.floor(suby * qfactor);

                //x3dom.debug.logInfo("Latitude bands:  "+ latitudeBands);
                //x3dom.debug.logInfo("Longitude bands: "+ longitudeBands);

				var theta, sinTheta, cosTheta;
				var phi, sinPhi, cosPhi;
				var x, y, z, u, v;

				for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
					theta = (latNumber * Math.PI) / latitudeBands;
					if(this._vf.hemi)
						theta = theta/2;
					sinTheta = Math.sin(theta);
					cosTheta = Math.cos(theta);

					for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
						phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
						sinPhi = Math.sin(phi);
						cosPhi = Math.cos(phi);

						x = -cosPhi * sinTheta;
						y = -cosTheta;
						z = -sinPhi * sinTheta;

						u = 0.25 - ((1.0 * longNumber) / longitudeBands);
						v = latNumber / latitudeBands;

						this._mesh._positions[0].push(r * x);
						this._mesh._positions[0].push(r * y);
						this._mesh._positions[0].push(r * z);
						this._mesh._normals[0].push(x);
						this._mesh._normals[0].push(y);
						this._mesh._normals[0].push(z);
						this._mesh._texCoords[0].push(u);
						this._mesh._texCoords[0].push(v);
					}
				}

				var first, second;

				for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
					for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
						first = (latNumber * (longitudeBands + 1)) + longNumber;
						second = first + longitudeBands + 1;

						this._mesh._indices[0].push(first);
						this._mesh._indices[0].push(second);
						this._mesh._indices[0].push(first + 1);

						this._mesh._indices[0].push(second);
						this._mesh._indices[0].push(second + 1);
						this._mesh._indices[0].push(first + 1);
					}
				}
				
				this._mesh._invalidate = true;
				this._mesh._numFaces = this._mesh._indices[0].length / 3;
				this._mesh._numCoords = this._mesh._positions[0].length / 3;

				x3dom.geoCache[geoCacheID] = this._mesh;
			}
        },
        {
            fieldChanged: function(fieldName) {
                 if (fieldName === "radius") {  
                    this._mesh._positions[0] = [];
					this._mesh._normals[0] = [];
					var r = this._vf.radius;
					var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
					var qfactor = this._quality;
									
					var latNumber, longNumber;
					var latitudeBands = Math.floor(subx * qfactor);
					var longitudeBands = Math.floor(suby * qfactor);
					
					var theta, sinTheta, cosTheta;
					var phi, sinPhi, cosPhi;
					var x, y, z;
	
					for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
						theta = (latNumber * Math.PI) / latitudeBands;
						sinTheta = Math.sin(theta);
						cosTheta = Math.cos(theta);
	
						for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
							phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
							sinPhi = Math.sin(phi);
							cosPhi = Math.cos(phi);
	
							x = -cosPhi * sinTheta;
							y = -cosTheta;
							z = -sinPhi * sinTheta;
	
							this._mesh._positions[0].push(r * x);
							this._mesh._positions[0].push(r * y);
							this._mesh._positions[0].push(r * z);
						}
					}
					
					this._mesh._invalidate = true;
					this._mesh._numCoords = this._mesh._positions[0].length / 3;
				
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                } else if (fieldName === "subdivision") {
					this._mesh._positions[0] = [];
					this._mesh._indices[0] =[];
					this._mesh._normals[0] = [];
					this._mesh._texCoords[0] =[];
					
					var r = this._vf.radius;
					var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
					var qfactor = this._quality;
					
					var latNumber, longNumber;
					var latitudeBands = Math.floor(subx * qfactor);
					var longitudeBands = Math.floor(suby * qfactor);
	
					var theta, sinTheta, cosTheta;
					var phi, sinPhi, cosPhi;
					var x, y, z, u, v;
	
					for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
						theta = (latNumber * Math.PI) / latitudeBands;
						sinTheta = Math.sin(theta);
						cosTheta = Math.cos(theta);
	
						for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
							phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
							sinPhi = Math.sin(phi);
							cosPhi = Math.cos(phi);
	
							x = -cosPhi * sinTheta;
							y = -cosTheta;
							z = -sinPhi * sinTheta;
	
							u = 0.25 - ((1.0 * longNumber) / longitudeBands);
							v = latNumber / latitudeBands;
	
							this._mesh._positions[0].push(r * x);
							this._mesh._positions[0].push(r * y);
							this._mesh._positions[0].push(r * z);
							this._mesh._normals[0].push(x);
							this._mesh._normals[0].push(y);
							this._mesh._normals[0].push(z);
							this._mesh._texCoords[0].push(u);
							this._mesh._texCoords[0].push(v);
						}
					}
	
					var first, second;
	
					for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
						for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
							first = (latNumber * (longitudeBands + 1)) + longNumber;
							second = first + longitudeBands + 1;
	
							this._mesh._indices[0].push(first);
							this._mesh._indices[0].push(second);
							this._mesh._indices[0].push(first + 1);
	
							this._mesh._indices[0].push(second);
							this._mesh._indices[0].push(second + 1);
							this._mesh._indices[0].push(first + 1);
						}
					}
					
					this._mesh._invalidate = true;
					this._mesh._numFaces = this._mesh._indices[0].length / 3;
					this._mesh._numCoords = this._mesh._positions[0].length / 3;
					
					 Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                    });
				}
            }
        }
    )
);
