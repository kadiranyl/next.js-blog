import { useRouter } from 'next/router'
import { firestore } from '../../lib/firebase';
import Link from 'next/link';
import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import BounceLoader from "react-spinners/BounceLoader";
import Head from 'next/head';

import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
import { useAuth } from '../../context/AuthContext';
import { GrSearch } from 'react-icons/gr'
import Image from 'next/image';

// import 'dayjs/locale/tr'

export default function Category() {
  dayjs.extend(relativeTime)

  // dayjs.locale('tr') 

  const { fireUsers, categoriesArray } = useAuth()
  

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
  
            <span className="text-gray-800"><b>{filteredBlogsArray.length}</b> {filteredBlogsArray.length === 1 ? "blog" : "blogs"} found from <b>{category.name}</b></span>
          </div>
  
  
          {filteredBlogsArray.length>0 ?
          <div className="flex flex-col gap-9">
          
          {filteredBlogsArray.map(blog => (
            <div className="flex justify-between gap-9 items-center" key={blog.id}>
              <Link href={"/blogs/" + blog.link}>
                <a className="w-24 md:w-48 flex items-center justify-center h-48">
                  <Image width="200px" height="200px" src={blog.image} className="object-cover rounded-xl" alt="" />
                </a>
              </Link>
              <div className="flex flex-col w-[70%] justify-center">
              <span className="text-black border-2 font-bold uppercase border-black w-fit px-3 py-[5px] text-xs mb-2">{categoriesArray.find(category => category.id === blog.category) ? categoriesArray.find(category => category.id === blog.category).name : "Deleted Category"}</span>
                <Link href={"/blogs/" + blog.link}>
                  <a className="text-2xl font-bold mb-1">{blog.title}</a>
                </Link>
                <p className="text-gray-400 text-sm mb-6">{blog.shortContent && blog.shortContent.length > 200 ? blog.shortContent.slice(0, 200) + "..." : blog.shortContent}</p>
                <div className="flex justify-start rounded-lg items-center gap-3">
                <Link href={"/users/" + fireUsers.find(user => user.uid === blog.author).link}>
                  <a className='flex items-center'>
                    <Image width="32px" height="32px" src={fireUsers.find(user => user.uid === blog.author).imageUrl} className="rounded-full cursor-pointer" alt="" />
                  </a>
                </Link>
                <div className="flex flex-col justify-center">
                  <Link href={"/users/" + fireUsers.find(user => user.uid === blog.author).link}>
                    <a className="text-sm font-semibold text-gray-600">{fireUsers.find(user => user.uid === blog.author).displayName}</a>
                  </Link>
                  <span className="text-xs text-gray-400">{dayjs.unix(blog.createdAt.seconds).fromNow()}</span>
                </div>
              </div>
              </div>
            </div>
          ))}
          </div>
          
          : 
            <span className="font-semibold text-gray-800">Sorry, no blog found.</span>
          }
          
  
        </div>
  
        <hr className="border-1 border-gray-300 w-full md:hidden" />
        
        <sidebar className="w-full flex flex-col gap-14 md:w-1/4">
          <div className="w-full h-10 relative flex items-center">
            <GrSearch className="absolute left-4 w-4" />
            <input type="text" className="w-full h-full py-4 pl-11 bg-gray-100 text-sm pr-2 rounded-xl focus:outline-none" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          
          <div className="">
            <h4 className="flex items-center gap-2 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                  width="16px" height="16px" viewBox="0 0 52 52" enableBackground="new 0 0 52 52">
                <g>
                  <path d="M27.2,41.7c-0.7-0.1-1.4-0.2-2.1-0.3s-1.4-0.3-2.1-0.6c-0.4-0.1-0.9,0-1.2,0.3l-0.5,0.5
                    c-2.9,2.9-7.6,3.2-10.6,0.6c-3.4-2.9-3.5-8.1-0.4-11.2l7.6-7.6c1-1,2.2-1.6,3.4-2c1.6-0.4,3.3-0.3,4.8,0.3c0.9,0.4,1.8,0.9,2.6,1.7
                    c0.4,0.4,0.7,0.8,1,1.3c0.4,0.7,1.3,0.8,1.8,0.2c0.9-0.9,2.1-2.1,2.8-2.8c0.4-0.4,0.4-1,0.1-1.5C34,20,33.5,19.5,33,19
                    c-0.7-0.7-1.5-1.4-2.4-1.9c-1.4-0.9-3-1.5-4.7-1.8c-3.1-0.6-6.5-0.1-9.3,1.4c-1.1,0.6-2.2,1.4-3.1,2.3l-7.3,7.3
                    c-5.3,5.3-5.7,13.9-0.6,19.3c5.3,5.8,14.3,5.9,19.8,0.4l2.5-2.5C28.6,43,28.1,41.8,27.2,41.7z"/>
                  <path d="M45.6,5.8c-5.5-5.1-14.1-4.7-19.3,0.6L24,8.6c-0.7,0.7-0.2,1.9,0.7,2c1.4,0.1,2.8,0.4,4.2,0.8
                    c0.4,0.1,0.9,0,1.2-0.3l0.5-0.5c2.9-2.9,7.6-3.2,10.6-0.6c3.4,2.9,3.5,8.1,0.4,11.2L34,28.8c-1,1-2.2,1.6-3.4,2
                    c-1.6,0.4-3.3,0.3-4.8-0.3c-0.9-0.4-1.8-0.9-2.6-1.7c-0.4-0.4-0.7-0.8-1-1.3c-0.4-0.7-1.3-0.8-1.8-0.2l-2.8,2.8
                    c-0.4,0.4-0.4,1-0.1,1.5c0.4,0.6,0.9,1.1,1.4,1.6c0.7,0.7,1.6,1.4,2.4,1.9c1.4,0.9,3,1.5,4.6,1.8c3.1,0.6,6.5,0.1,9.3-1.4
                    c1.1-0.6,2.2-1.4,3.1-2.3l7.6-7.6C51.5,20.1,51.3,11.1,45.6,5.8z"/>
                </g>
              </svg>
              Popular Blogs
            </h4>
          </div>
  
          <div className="flex flex-col md:overflow-y-scroll">
            <h4 className="flex items-center gap-2 font-bold">
              <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.07689 2.41025C8.35894 2.20513 7.23074 2 6.41023 2C5.58973 2 4.46153 2.20513 3.74358 2.41025C3.02564 2.51282 2.51282 3.02564 2.41025 3.74358C2.20513 4.46153 2 5.58973 2 6.41023C2 7.23074 2.20513 8.35894 2.30769 9.07689C2.41025 9.79483 3.02564 10.3076 3.64102 10.4102C4.35896 10.5128 5.48716 10.7179 6.30767 10.7179C7.12818 10.7179 8.25638 10.5128 8.97432 10.4102C9.69227 10.3076 10.2051 9.69227 10.3077 9.07689C10.4102 8.35894 10.6153 7.23074 10.6153 6.41023C10.6153 5.58973 10.4102 4.46153 10.3077 3.74358C10.3077 3.02564 9.79483 2.51282 9.07689 2.41025Z" fill="#030D45"/>
              <path d="M9.07684 13.6923C8.35889 13.5897 7.23069 13.3846 6.41018 13.3846C5.58968 13.3846 4.46148 13.5897 3.74353 13.6923C3.02559 13.7949 2.51277 14.4102 2.4102 15.0256C2.30764 15.7436 2.10251 16.8718 2.10251 17.6923C2.10251 18.5128 2.30764 19.641 2.4102 20.3589C2.51277 21.0769 3.12815 21.5897 3.74353 21.6923C4.46148 21.7948 5.58968 22 6.41018 22C7.23069 22 8.35889 21.7948 9.07684 21.6923C9.79478 21.5897 10.3076 20.9743 10.4102 20.3589C10.5127 19.641 10.7179 18.5128 10.7179 17.6923C10.7179 16.8718 10.5127 15.7436 10.4102 15.0256C10.3076 14.3077 9.79478 13.7949 9.07684 13.6923Z" fill="#030D45"/>
              <path d="M15.0255 10.4104C15.7435 10.513 16.8717 10.7181 17.6922 10.7181C18.5127 10.7181 19.6409 10.513 20.3588 10.4104C21.0768 10.3078 21.5896 9.69246 21.6921 9.07708C21.7947 8.35914 21.9998 7.23094 21.9998 6.41043C21.9998 5.58992 21.7947 4.46172 21.6921 3.74377C21.5896 3.02583 20.9742 2.51301 20.3588 2.41045C19.6409 2.30788 18.5127 2.10276 17.6922 2.10276C16.8717 2.10276 15.7435 2.30788 15.0255 2.41045C14.3076 2.51301 13.7947 3.12839 13.6922 3.74377C13.5896 4.46172 13.3845 5.58992 13.3845 6.41043C13.3845 7.23094 13.5896 8.35914 13.6922 9.07708C13.7947 9.79503 14.3076 10.3078 15.0255 10.4104Z" fill="#030D45"/>
              <path d="M20.3588 13.6923C19.6409 13.5897 18.5127 13.3846 17.6922 13.3846C16.8717 13.3846 15.7435 13.5897 15.0255 13.6923C14.3076 13.7949 13.7947 14.4102 13.6922 15.0256C13.5896 15.7436 13.3845 16.8718 13.3845 17.6923C13.3845 18.5128 13.5896 19.641 13.6922 20.3589C13.7947 21.0769 14.4101 21.5897 15.0255 21.6923C15.7435 21.7948 16.8717 22 17.6922 22C18.5127 22 19.6409 21.7948 20.3588 21.6923C21.0768 21.5897 21.5896 20.9743 21.6921 20.3589C21.7947 19.641 21.9998 18.5128 21.9998 17.6923C21.9998 16.8718 21.7947 15.7436 21.6921 15.0256C21.5896 14.3077 21.0768 13.7949 20.3588 13.6923Z" fill="#030D45"/>
              </svg>
              Categories
            </h4>
            <div className="flex flex-col gap-4 mt-6">
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
        </sidebar>
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
