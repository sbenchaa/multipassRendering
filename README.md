# Multi-passing image processing using X3DOM
### Copyright Sofiane Benchaa, 2012.


**EN :** I propose an implementation of ping-pong algorithm on 2 FBOs for X3DOM.
The ping-pong technique is used for realizing multi-pass rendering or the GPU iteratives computations. It's a simple process : 'A' FBO unwraps his render task,
'B' FBO collects 'A' as sampler2D which does his rendering...'A' collects 'B' etc. until the achievement was stabilized.

We see a major gain to this process, indeed the GPU computations are most speedier than CPU and the heavy computations are done without a CPU bridge.

The X3DOM wasn't outdone, it's possible to implement this with the natives components like the "renderedTexture" and the referencing attributes DEF/USE.

Note the singularity of the HTML/DOM where the RBO are imbricated but they have a mirrored referencing (vice versa).

Enjoy !

**Observation :** *in order to increase the computations, I recommend to apply the same job to the 2 RBOs (speed up : x2).*

***

**FR :** Je propose une implantation de l'algorithme de ping-pong sur 2 FBOs pour X3DOM.
La technique de ping-pong permet de réaliser des rendus multi-passes ou effectuer des calcules iteratifs sur GPU.
Le principe est simple : un FBO A effectue sa tâche de rendu, le FBO B réccupère FBO A sous forme de sampler2D qui réalise
son traitement et effectue également sa tâche de rendu...FBO A réccupère FBO B etc. jusqu'a atteindre sa stabilité itérative.

L'intérêt d'une telle application est majeure car les opération GPU sont beaucoups plus rapides que sur CPU, ainsi de lourds calcules
sont réalisés sans qu'il n'y de transfert sur CPU.

X3DOM ne fait pas exception, il est tout à fait possible de réaliser cela avec le composant "renderedTexture" et le mécanisme de référence
DEF/USE. Notez la particularité du DOM où les RBO sont imbriqués mais pointent l'un vers l'autre (et vice versa).

Ce que vous voyez est le résultat des opérations effectuées des RBO Ping et Pong dans Pang ;) 

**Remarque :** *pour une itération rapide le même traitement peut être appliqué aux 2 RBO (speed up de 2 sur les opérations convergentes ou itérantes).*
