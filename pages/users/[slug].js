import { useRouter } from 'next/router'
import { app, firestore } from '../../lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useState, useEffect } from "react";
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';

export default function User() {
  dayjs.extend(relativeTime)

    const { categoriesArray } = useAuth()

    const [usersArray, setUsersArray] = useState([])
    const [user, setUser] = useState('')
    const [blogs, setBlogs] = useState([])

    const getUsers = () => {
        getDocs(collection(firestore, 'accounts'))
        .then((data) => {
            setUsersArray(data.docs.map((item) => {
            return { ...item.data(), id: item.id }
          }));
        })
      }
    
    useEffect(() => {
    getUsers();
    }, [])
    //bitiş
    

    const getBlogs = () => {
      //desc tersten sıralaması için
        getDocs(query(collection(firestore, 'blogs'), orderBy("filterDate", "desc"), where("author", "==", user.uid)))
        .then((data) => {
          setBlogs(data.docs.map((item) => {
            return { ...item.data(), id: item.id }
          }));
        })
    }
    useEffect(() => {
      if (user) {
        getBlogs()
      }
    }, [user])

      
    //kullanıcının routerını al ve slug'a ata
    const router = useRouter()
    const { slug } = router.query


    useEffect(() => {

      //Blog arrayını tek tek geziyor linki slugla eşleşen olursa setBlog diyerek o blogu ekliyor
      usersArray.filter(name => name.link == slug && setUser(name))
    })


    if (usersArray.map(blog => blog.link == slug) && user && blogs) {
        return (
            <>
            <Head>
              <title>{user.displayName}</title>
            </Head>
            <div className='w-[80%] md:w-[40%] mx-auto flex flex-col items-center gap-16 justify-center my-6'>
                <div className='flex items-center justify-start gap-8 w-full'>
                  <Image width="96px" height="96px" src={user.imageUrl} alt="" className='object-cover flex-none rounded-full' />
                  <div className='flex flex-col justify-center max-w-[70%]'>
                    <h2 className='text-xl font-bold'>{user.displayName}</h2>
                    <p className='text-sm text-gray-400'>{user.biography}</p>
                    <div className='flex items-center justify-center gap-4 mt-5'>
                      {user.socialMedia.facebook && (
                        <Link href={"https://www.facebook.com/" + user.socialMedia.facebook}>
                          <a className='cursor-pointer transition hover:text-gray-500' target="_blank">
                            <FaFacebook size={18} />
                          </a>
                        </Link>
                      )}
                      
                      {user.socialMedia.instagram && (
                      <Link href={"https://www.instagram.com/" + user.socialMedia.instagram}>
                        <a className='cursor-pointer transition hover:text-gray-500' target="_blank">
                          <FaInstagram size={18} />
                        </a>
                      </Link>
                      )}

                      {user.socialMedia.twitter && (
                      <Link href={"https://www.twitter.com/" + user.socialMedia.twitter}>
                        <a className='cursor-pointer transition hover:text-gray-500' target="_blank">
                          <FaTwitter size={18} />
                        </a>
                      </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex flex-col w-full gap-4'>
                  <h2 className='text-lg text-left font-bold'>Shared blogs</h2>
                  <div className="flex flex-col items-center h-full w-full gap-6">
                    
                    {blogs.length>0 ? blogs.map(blog => (
                    <div className="flex justify-between gap-9 w-full items-center" key={blog.id}>
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
                            <Link href="#">
                            <a className='flex items-center'>
                                <Image width="32px" height="32px" src={user.imageUrl} className="rounded-full cursor-pointer" alt="" />
                            </a>
                            </Link>
                            <div className="flex flex-col justify-center">
                            <Link href="#">
                                <a className="text-sm font-semibold text-gray-600">{user.displayName}</a>
                            </Link>
                            <span className="text-xs text-gray-400">{dayjs.unix(blog.createdAt.seconds).fromNow()}</span>
                            </div>
                        </div>
                        </div>
                    </div>
                    )) : 
                        <span className="text-left w-full text-gray-400">Sorry, no blog found.</span>
                    }

                </div>
                </div>
            </div>
            </>
        )
    }
}
