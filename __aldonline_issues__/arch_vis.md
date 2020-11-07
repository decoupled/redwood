[RFC] Redwood Architecture Visualization

* Redwood's standard layered architecture is one of its main strengths (db schema -> services -> SDLs -> Cells -> UI)
* For complex Redwood apps, this structure/convention can help developers find their way around their codebase.

Is this possible?
* This is still unclear. Extracting a useful visualization is only possible if Redwood apps respect the structure, and we can infer that structure from code. The most pragmatic way to validate this is to try to build it.

Benefits:
* For new developers: Redwood would become easier to explain and understand. (ex: They run a generator and see how all the parts fit together).
* For existing developers: If the visualization is integrated into the IDE, it can enable workflows. This is inspired by the following story (from @dthyresson):

```
When working on a feature that cuts accross layers, David usually opens several files:
* The UI / Cells
* The SDLs that feeds the cells

```

* To build on this idea, I propose we explore providing a visual architecture
* I believe that it would be valuable to generate a visualization
* This visualization could be integrated into the IDE to allow easy navigation

# Is it possible?

I'm not 100% sure.
The first step is to extract the diagram data model. Let's see if we can do that first.

The @redwoodjs/structure package has


How?

`Redwood: Open Architecture Diagram`

This diagram can be clicked to.

# Data Model

