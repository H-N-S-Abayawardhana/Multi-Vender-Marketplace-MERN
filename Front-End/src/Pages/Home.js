import React from 'react';
import NavBar from '../components/NavBar'
import Footer from '../components/Footer';
import UserItemList from '../components/UserItemList';

const Home = () => {
    return (
        <>
            <NavBar/>
       
            <UserItemList/>
            <Footer/>
        </>
    );
};

export default Home;