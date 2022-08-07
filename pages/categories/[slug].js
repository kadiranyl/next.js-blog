import { useRouter } from 'next/router'
import { firestore } from '../../lib/firebase';
import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import BounceLoader from "react-spinners/BounceLoader";
import Head from 'next/head';

import { useAuth } from '../../context/AuthContext';
import BlogList from '../../components/BlogList';
import Sidebar from '../../components/Sidebar';


export default function Category() {

  const { fireUsers, categoriesArray, lastUsers } = useAuth()
  

    //Blogları çek
    const [category, setCategory] = useState('')    
      
    //kullanıcının routerını al ve slug'a ata
    const router = useRouter()
    const { slug } = router.query


    const [blogsArray, setBlogsArray] = useState([])
    const [oldFilteredBlogsArray, setOldFilteredBlogsArray] = useState([])
    const [filteredBlogsArray, setFilteredBlogsArray] = useState([])
  
    const [filter, setFilter] = useState('newest')
    const [search, setSearch] = useState('')
  
  
  
    //Kategorileri al
    
  
  
  
    //Blogları al
    const getBlogs = () => {
        if (category !== '') {
          getDocs(query(collection(firestore, 'blogs'), orderBy("filterDate"), where("category", "==", category.id)))
        .then((data) => {
          setFilteredBlogsArray(data.docs.reverse().map((item) => {
            return { ...item.data(), id: item.id }
          }));
        })
  
        getDocs(query(collection(firestore, 'blogs'), orderBy("filterDate"), where("category", "==", category.id)))
        .then((data) => {
          setBlogsArray(data.docs.reverse().map((item) => {
            return { ...item.data(), id: item.id }
          }));
        })
        }
    }

    
    useEffect(() => {
      getBlogs();

      if (category !== '') {
        blogsArray.filter(name => name.category == category.name && setBlogsArray([name]))
      }
    }, [category])
  
  
  
    //Filtreleme
    const changeFilter = (e) => {
      setFilter(e)
      setSearch('')
  
      switch (e) {
        case "newest":
          setOldFilteredBlogsArray([])
          setFilteredBlogsArray([])
  
          if (category !== '') {
            getDocs(query(collection(firestore, 'blogs'), orderBy("filterDate"), where("category", "==", category.id)))
            .then((data) => {
              setOldFilteredBlogsArray(data.docs.map((item) => {
                return { ...item.data(), id: item.id }
              }));
            })
          }
  
          setFilteredBlogsArray(oldFilteredBlogsArray.reverse())
  
          break;
  
        case "oldest":
          setFilteredBlogsArray([])
          setOldFilteredBlogsArray([])
  
          if (category !== '') {
            getDocs(query(collection(firestore, 'blogs'), orderBy("filterDate"), where("category", "==", category.id)))
            .then((data) => {
              setOldFilteredBlogsArray(data.docs.map((item) => {
                return { ...item.data(), id: item.id }
              }));
            })
          }
  
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
    }, [category])
  
  
  
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


    useEffect(() => {

      //Blog arrayını tek tek geziyor linki slugla eşleşen olursa setBlog diyerek o blogu ekliyor
      categoriesArray.filter(name => name.link == slug && setCategory(name))


    })



    if (categoriesArray.map(blog => blog.link == slug) && category && fireUsers !== null) {
  
      return (
        <>
        <Head>
          <title>{category.name} | Acatay</title>
        </Head>
        <div className="w-3/4 md:w-full mx-auto flex justify-between py-8 gap-12 flex-col-reverse md:flex-row md:h-[85vh]">
        
        <Sidebar search={search} setSearch={setSearch} categoriesArray={categoriesArray} lastUsers={lastUsers} />

        <hr className="border-1 border-gray-300 w-full md:hidden" />
          
        <BlogList filteredBlogsArray={filteredBlogsArray} fireUsers={fireUsers} categoriesArray={categoriesArray} changeFilter={changeFilter} />
  
        
      </div>
        </>
      )

    } else if(categoriesArray.map(blog => blog.link == slug) && !category) {
      return (
        <div className='h-screen absolute top-0 left-0 bg-white w-full flex items-center justify-center'>
          <BounceLoader color="black" loading="true" size={50} />
        </div>
      )
    }
    //Blogları tek tek gez router ile eşleşirse kullanıcı var olan bir sayfadadır
    
    return (
        <div>No blog found.</div>
    )

}
