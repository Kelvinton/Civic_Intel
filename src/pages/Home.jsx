import Hero from "../components/home/Hero.jsx";
import NationalSnapshot from "../components/home/NationalSnapshot.jsx";
import Categories from "../components/home/Categories.jsx";
import CompareStates from "../components/home/CompareStates.jsx";
import FeaturedRealeased from "../components/home/FeaturedRelease.jsx";
import LatestReports from "../components/home/LatestReports.jsx";
import OpinionPoll from "../components/home/OpinionPoll.jsx";

function Home() {
    return(
        <>
            <Hero />
            <NationalSnapshot />
            <Categories />
            <CompareStates />
            <FeaturedRealeased />
            <LatestReports />
            <OpinionPoll />
        
        </>
    )
}

export default Home