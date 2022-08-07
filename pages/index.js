import { useState, useEffect } from "react";
import Head from "next/head";
import { firestore } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

import BlogList from "../components/BlogList";

import Sidebar from "../components/Sidebar";

export default function Home() {

  const { fireUsers, categoriesArray, lastUsers } = useAuth()

  const [blogsArray, setBlogsArray] = useState([])
  const [oldFilteredBlogsArray, setOldFilteredBlogsArray] = useState([])
  const [filteredBlogsArray, setFilteredBlogsArray] = useState([])

  const [filter, setFilter] = useState('newest')
  const [search, setSearch] = useState('')




  //Blogları al
  const getBlogs = () => {
    //desc tersten sıralaması için
      getDocs(query(collection(firestore, 'blogs'), orderBy("filterDate", "desc")))
      .then((data) => {
        setFilteredBlogsArray(data.docs.map((item) => {
          return { ...item.data(), id: item.id }
        }));
      })

      getDocs(query(collection(firestore, 'blogs'), orderBy("filterDate", "desc")))
      .then((data) => {
        setBlogsArray(data.docs.map((item) => {
          return { ...item.data(), id: item.id }
        }));
      })
  }
  useEffect(() => {
    getBlogs();
  }, [])


  //Filtreleme
  const changeFilter = (e) => {
    setFilter(e)
    setSearch('')

    switch (e) {
      case "newest":
        setOldFilteredBlogsArray([])
        setFilteredBlogsArray([])

        getDocs(query(collection(firestore, 'blogs'), orderBy("filterDate")))
        .then((data) => {
          setOldFilteredBlogsArray(data.docs.map((item) => {
            return { ...item.data(), id: item.id }
          }));
        })

        setFilteredBlogsArray(oldFilteredBlogsArray.reverse())

        break;

      case "oldest":
        setFilteredBlogsArray([])
        setOldFilteredBlogsArray([])

        getDocs(query(collection(firestore, 'blogs'), orderBy("filterDate")))
        .then((data) => {
          setOldFilteredBlogsArray(data.docs.map((item) => {
            return { ...item.data(), id: item.id }
          }));
        })

        setFilteredBlogsArray(oldFilteredBlogsArray)

        break;

      case "popular":
        setFilteredBlogsArray([])

        break;
    }

  }

  //Kullanıcı siteye ilk girdiğinde fonksiyon çalışsın diye
  useEffect(() => {
    changeFilter(filter)
  }, [])



  //Arama
  useEffect(() => {
    setFilteredBlogsArray([])

    if (filter === "newest") {
      blogsArray.filter(name => name.title.toLowerCase().includes(search.toLocaleLowerCase())).map(filteredName => 
        setFilteredBlogsArray(oldarray => [...oldarray, filteredName])
      )
    } else {
      oldFilteredBlogsArray.filter(name => name.title.toLowerCase().includes(search.toLocaleLowerCase())).map(filteredName => 
        setFilteredBlogsArray(oldarray => [...oldarray, filteredName])
      )
    }

  }, [search]);
  
  if (fireUsers !== null) {
  return (
    <>
    <Head>  
      <title>Acatay</title>
    </Head>
    <div className="w-3/4 md:w-full mx-auto flex justify-between py-8 gap-12 flex-col-reverse md:flex-row md:h-[85vh]">
      
      <Sidebar search={search} setSearch={setSearch} categoriesArray={categoriesArray} lastUsers={lastUsers} />
      
      <hr className="border-1 border-gray-300 w-full md:hidden" />

        <BlogList filteredBlogsArray={filteredBlogsArray} fireUsers={fireUsers} categoriesArray={categoriesArray} changeFilter={changeFilter} />
        
    </div>
    </>
  )
            }
}
