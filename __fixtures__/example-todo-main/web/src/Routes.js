// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Router, Route, Private } from '@redwoodjs/router'

const Routes = () => {
  // <-- this point
  return (
    <Router>
      <Route path="/" page={HomePage} name="home" />
      <Route notfound page={NotFoundPage} />
      <Private>
        <Route path="/" page={HomePage} name="home" whileLoading={() => {}}/>
      </Private>
    </Router>
  )
}

const Routes_ = (props) => {
  switch (props.whileValidatePath){
    case "/":
      return () => {};
  }
  return (
    <Router>
      <Route path="/" page={HomePage} name="home" />
      <Route notfound page={NotFoundPage} />
      <Private>
        <Route path="/" page={HomePage} name="home" whileLoading={() => {}}/>
      </Private>
    </Router>
  )
}

export default Routes
