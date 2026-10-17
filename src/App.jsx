import NavBar from "./components/NavBar.jsx";
import Hero from "./components/Hero.jsx";
import Footer from "./components/Footer.jsx";
import NationalSnapshot from "./components/NationalSnapshot.jsx";
import Categories from "./components/Categories.jsx";
import CompareStates from "./components/CompareStates.jsx";
import FeaturedRelease from "./components/FeaturedRelease.jsx";
import LatestReports from "./components/LatestReports.jsx";
import OpinionPoll from "./components/OpinionPoll.jsx";


function App(){
  return(
    <>
      <NavBar />
      <Hero/>
      <main>
        <NationalSnapshot />
        <Categories />
        <CompareStates />
        <FeaturedRelease />
        <LatestReports />
        <OpinionPoll />

      </main>
      <Footer />

      
      
    </>
  )
  
}
export default App