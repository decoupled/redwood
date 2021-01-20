declare const x: any

const router = x.structure.getRouter()

for (const route of router.routes) {
  const fp = route.page.getFilePath()
  // executing runtime code that defines a component
  const PageComponent$ = require(fp) /* executing runtime code */
  const renderedPage = x.render(<div>{PageComponent}</div>)
  const html = renderedPage.html()
}

// -----

const routerFilePath = router.getFilePath() // foo/src/Routes.js

/*
let's evaluate this:

import { Router, Route } from '@redwoodjs/router'

const Routes = () => {
  return (
    <Router>
      <Route path="/" page={HomePage} name="home" />
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
*/

const routerRuntimeComponent$ = require(routerFilePath) // <><Router></>

const whileLoadingComponent$ = routerRuntimeComponent$('/dash/accounts')

/*

strategy one: runtime black box with global stashing
* execute the Router code (require("Routes.js"))
* make sure that the execution path will touch that
* add some code to a point where you can grab what you need
* store it globally
* grab it

rewrite the Routes.js file to what you need

*/
