import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { app, firestore, auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, orderBy, query, doc, getDoc } from 'firebase/firestore';
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from "dayjs";

import { GrSearch } from 'react-icons/gr'
import Image from "next/image";
import BlogList from "../components/BlogList";
import { MdCategory } from 'react-icons/md'
import { BsFillStarFill } from 'react-icons/bs'
import { FaUserPlus } from 'react-icons/fa'

export default function Home(isAdmin) {
  dayjs.extend(relativeTime)

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
    <div className="w-3/4 mx-auto flex justify-between py-8 gap-12 flex-col-reverse md:flex-row md:h-[85vh]">
      <div className="flex flex-col gap-6 md:gap-12 w-full relative md:overflow-y-scroll md:w-3/4">
        
        <div className="flex flex-col bg-white justify-center gap-4 py-5">
          <select className="w-fit px-4 bg-gray-100 rounded-lg py-2 focus:outline-none" onChange={(e) => changeFilter(e.target.value)}>
            <option value="newest">
                Sort by Newest
            </option>
            <option value="oldest">
                Sort by Oldest
            </option>
            {/* <option value="popular">
                Sort by Popular
            </option> */}
          </select>

          <span className="text-gray-800"><b>{filteredBlogsArray.length}</b> {filteredBlogsArray.length === 1 ? "blog" : "blogs"} found</span>
        </div>


        <BlogList filteredBlogsArray={filteredBlogsArray} fireUsers={fireUsers} categoriesArray={categoriesArray} />
        

      </div>

      <hr className="border-1 border-gray-300 w-full md:hidden" />
      
      <div className="w-full flex flex-col gap-14 md:w-1/4">
        <div className="w-full h-10 relative flex items-center">
          <GrSearch className="absolute left-4 w-4" />
          <input type="text" className="w-full h-full py-4 pl-11 bg-gray-100 text-sm pr-2 rounded-xl focus:outline-none" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        
        <div className="">
          <h4 className="flex items-center gap-2 font-bold">
            <BsFillStarFill />
            Popular Blogs
          </h4>
        </div>

        <div className="flex flex-col md:overflow-y-scroll">
          <h4 className="flex items-center gap-2 font-bold">
            <MdCategory />
            Categories
          </h4>
          <div className="flex flex-col gap-4 mt-4">
            {categoriesArray.map(category =>
              <Link href={"/categories/" + category.link} key={category.id}>
                <a className="flex items-center gap-2 group">
                  <Image width="20px" height="20px" src={category.image} alt="" className="object-cover" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">{category.name}</span>
                </a> 
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col md:overflow-y-scroll">
          <h4 className="flex items-center gap-2 font-bold">
            <FaUserPlus />
            Last Members
          </h4>
          <div className="flex flex-col gap-4 mt-4">
            {lastUsers.map(user =>
              <Link href={"/users/" + user.link} key={user.id}>
                <a className="flex items-center gap-3 group">
                  <Image width="32px" height="32px" src={user ? user.imageUrl : ""} alt="" className="object-cover rounded-full" />
                  <div className="flex justify-center flex-col">
                    <span className="text-sm text-gray-600 transition font-bold group-hover:text-gray-900">{user.displayName}</span>
                    <span className="text-xs text-gray-400 transition group-hover:text-gray-500">{dayjs.unix(user.createdAt.seconds).fromNow()}</span>
                  </div>
                </a> 
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
            }
}
