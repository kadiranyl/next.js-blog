import { useRouter } from 'next/router'
import { app, firestore } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useState, useEffect } from "react";
import BounceLoader from "react-spinners/BounceLoader";
import { useAuth } from '../../context/AuthContext';
import Head from 'next/head';

import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'

import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogDetails() {
  dayjs.extend(relativeTime)

    const { fireUsers, categoriesArray } = useAuth()


    //Blogları çek
    const [blogsArray, setBlogsArray] = useState([])
    const [blog, setBlog] = useState('')
    const [loader, setLoader] = useState(true)
    const [noBlog, setNoBlog] = useState(false)


    const getBlogs = () => {
        getDocs(collection(firestore, 'blogs'))
        .then((data) => {
          setBlogsArray(data.docs.map((item) => {
            return { ...item.data(), id: item.id }
          }));
        })
      }
    
    useEffect(() => {
    getBlogs();

    }, [])
    //bitiş
    
      
    //kullanıcının routerını al ve slug'a ata
    const router = useRouter()
    const { slug } = router.query


    useEffect(() => {

      //Blog arrayını tek tek geziyor linki slugla eşleşen olursa setBlog diyerek o blogu ekliyor
      blogsArray.filter(name => name.link == slug && setBlog(name))
    })

    useEffect(() => {
      if (blog) {
        setLoader(false)
      } else {
        setNoBlog(true)
      }
    }, [blog])

    if (blogsArray.map(blog => blog.link == slug) && blog) {
  
      return (
          <>
          <Head>
            <title>{blog.title} | {fireUsers.find(user => user.uid === blog.author) ? fireUsers.find(user => user.uid === blog.author).displayName : "Deleted Account"}</title>
          </Head>
          <div className='w-[60%] mx-auto flex flex-col items-center my-16 gap-1'>
              <Image width="800px" height="400px" src={blog.image} className="rounded object-cover" alt="" />
              <div className='flex items-center justify-center gap-3 text-gray-400 text-sm mt-9'>
                <b>{categoriesArray.find(category => category.id === blog.category) ? categoriesArray.find(category => category.id === blog.category).name : "Deleted Category"}</b>
                <div className='bg-gray-500 w-1 h-1 rounded-full'></div>
                <span>{dayjs.unix(blog.createdAt.seconds).fromNow()}</span>
              </div>
              <h1 className='text-5xl font-bold text-gray-600 text-left'>{blog.title}</h1>

              <div className='flex flex-col mt-4 w-full'>
                <span className='text-lg text-left'>{blog.shortContent}</span>

                <div className='text-gray-500 mt-6 text-left text-sm blog-content' dangerouslySetInnerHTML={{ __html: blog.content }}></div>
              </div>

              <div className='w-[60%] py-8 gap-6 flex items-center justify-start px-8 mt-16 bg-gray-100 rounded-xl'>
                <Link href={fireUsers.find(user => user.uid === blog.author) ? "/users/" + fireUsers.find(user => user.uid === blog.author).link : "#"}>
                  <Image width="64px" height="64px" src={fireUsers.find(user => user.uid === blog.author) ? fireUsers.find(user => user.uid === blog.author).imageUrl : "/img/defaultUser.jpeg"} alt="" className='rounded-xl cursor-pointer' />
                </Link>
                <div className='flex-1 flex flex-col justify-center gap-1'>
                  <Link href={fireUsers.find(user => user.uid === blog.author) ? "/users/" + fireUsers.find(user => user.uid === blog.author).link : "#"}>
                    <a className='text-xl font-bold'>{fireUsers.find(user => user.uid === blog.author) ? fireUsers.find(user => user.uid === blog.author).displayName : "Deleted Account"}</a>
                  </Link>
                  <span className='text-sm text-gray-400'>{fireUsers.find(user => user.uid === blog.author) ? fireUsers.find(user => user.uid === blog.author).biography : ""}</span>
                  <div className='flex items-center gap-4 mt-5 w-full justify-center'>
                    {fireUsers.find(user => user.uid === blog.author) && fireUsers.find(user => user.uid === blog.author).socialMedia.facebook && (
                      <Link href={"https://www.facebook.com/" + fireUsers.find(user => user.uid === blog.author).socialMedia.facebook}>
                        <a className='cursor-pointer transition hover:text-gray-500' target="_blank">
                          <FaFacebook size={18} />
                        </a>
                      </Link>
                    )}
                    
                    {fireUsers.find(user => user.uid === blog.author) && fireUsers.find(user => user.uid === blog.author).socialMedia.instagram && (
                    <Link href={"https://www.instagram.com/" + fireUsers.find(user => user.uid === blog.author).socialMedia.instagram}>
                      <a className='cursor-pointer transition hover:text-gray-500' target="_blank">
                        <FaInstagram size={18} />
                      </a>
                    </Link>
                    )}

                    {fireUsers.find(user => user.uid === blog.author) && fireUsers.find(user => user.uid === blog.author).socialMedia.twitter && (
                    <Link href={"https://www.twitter.com/" + fireUsers.find(user => user.uid === blog.author).socialMedia.twitter}>
                      <a className='cursor-pointer transition hover:text-gray-500' target="_blank">
                        <FaTwitter size={18} />
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
    return (
        <>
          {loader ? (
            <div className='absolute top-0 left-0 w-full h-screen flex items-center justify-center'>
              <BounceLoader color="black" loading="true" size={50} />
            </div>
          ) : (
            <div>No blog found</div>
          )}
        </>
    )

}
