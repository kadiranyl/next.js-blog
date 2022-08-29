import { useRouter } from 'next/router'
import { firestore } from '../../lib/firebase';
import { collection, getDocs, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import { useState, useEffect } from "react";
import BounceLoader from "react-spinners/BounceLoader";
import { useAuth } from '../../context/AuthContext';
import Head from 'next/head';
const { DateTime } = require("luxon");

import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'

import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { AiFillLike } from 'react-icons/ai';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogDetails() {
  dayjs.extend(relativeTime)

    const { fireUsers, categoriesArray, user, toastSuccess, makeid, toastError } = useAuth()


    //Blogları çek
    const [blogsArray, setBlogsArray] = useState([])
    const [blog, setBlog] = useState('')
    const [loader, setLoader] = useState(true)
    const [noBlog, setNoBlog] = useState(false)
    const [comment, setComment] = useState('')


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

    const date = new Date()

    const addComment = (e) => {
      e.preventDefault()

      const id = makeid(15)

      blogsArray.map(blogg => {
        
          if (blogg.comments.length > 0 && blogg.comments.id === id) {
            toastError("An error happened, please refresh the page.")
          }
          else {
            console.log(blog.id);
            updateDoc(doc(firestore, 'blogs', blog.id), {
              comments: arrayUnion(
                {
                  uid: user.uid,
                  comment: comment,
                  like: [],
                  filterDate: DateTime.now().toUnixInteger(),
                  createdAt: date,
                  id
                }
              )
            })
            .then(() => {
              setComment('')
              getBlogs()
            })
          }
      })


    }

    const likeComment = async (id) => {





    }
    
    if (blogsArray.map(blog => blog.link == slug) && blog) {
  
      return (
          <>
          <Head>
            <title>{blog.title} | {fireUsers.find(user => user.uid === blog.author) ? fireUsers.find(user => user.uid === blog.author).displayName : "Deleted Account"}</title>
          </Head>
          <div className='w-[80%] md:w-[60%] mx-auto flex flex-col items-center my-16 gap-1'>
              <Image width="800px" height="400px" src={blog.image} className="rounded object-cover" alt="" />
              <div className='flex items-center justify-center gap-3 text-gray-400 text-sm mt-9'>
                <Link href={categoriesArray.find(category => category.id === blog.category) ? "/categories/" + categoriesArray.find(category => category.id === blog.category).link : "#"}>
                  <a className='font-bold'>{categoriesArray.find(category => category.id === blog.category) ? categoriesArray.find(category => category.id === blog.category).name : "Deleted Category"}</a>
                </Link>
                <div className='bg-gray-500 w-1 h-1 rounded-full'></div>
                <span>{dayjs.unix(blog.createdAt.seconds).fromNow()}</span>
              </div>
              <h1 className='text-5xl font-extrabold text-gray-600 text-left'>{blog.title}</h1>

              <div className='flex flex-col mt-4 w-full'>
                <span className='text-lg text-left'>{blog.shortContent}</span>

                <div className='text-gray-500 mt-6 text-left text-sm blog-content' dangerouslySetInnerHTML={{ __html: blog.content }}></div>
              </div>

              <hr className='w-full bg-gray-300 my-16'/>

              <div className='w-full flex-col md:flex-row md:w-[60%] py-8 gap-6 flex items-center justify-start px-8 bg-gray-100 rounded-xl'>
                <Link href={fireUsers.find(user => user.uid === blog.author) ? "/users/" + fireUsers.find(user => user.uid === blog.author).link : "#"}>
                  <Image width="72px" height="72px" src={fireUsers.find(user => user.uid === blog.author) ? fireUsers.find(user => user.uid === blog.author).imageUrl : "/img/defaultUser.jpeg"} alt="" className='rounded-xl object-cover cursor-pointer' />
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

              <hr className='w-full bg-gray-300 my-16'/>

              <div className=' flex flex-col gap-6 w-full'>
                {user && (
                  <div className='flex items-center justify-between w-full gap-4'>
                    <Image width="42px" height="42px" src={user.photoURL} alt="" className='rounded-full object-cover' />             
                    <form className='flex flex-1 gap-4 items-center' onSubmit={(e) => addComment(e)}>
                      <textarea className='h-14 w-full py-2 px-4 text-sm border border-1 border-gray-300 rounded-md focus:outline-none' placeholder='Add a comment...' value={comment} onChange={(e) => setComment(e.target.value)} required />
                      <button type='submit' className='text-xs border border-1 border-gray-400 py-2 rounded-md text-gray-400 px-6 transition-all duration-300 hover:bg-gray-400 hover:text-white'>Send</button>
                    </form>
                  </div>
                )}

                {blog.comments.map(comment => (
                <div className='flex items-center justify-start w-full gap-4' key={comment.id}>
                  <Link href={fireUsers.find(user => user.uid === comment.uid) ? "/users/" + fireUsers.find(user => user.uid === comment.uid).link : "#"}>
                    <a>
                      <Image width="42px" height="42px" src={fireUsers.find(user => user.uid === comment.uid) ? fireUsers.find(user => user.uid === comment.uid).imageUrl : "/img/defaultUser.jpeg"} alt="" className='rounded-full object-cover cursor-pointer' />
                    </a>
                  </Link>
                  <div className='flex flex-col justify-center gap-2 flex-1'>
                    <div className='flex items-center gap-2'>
                      <Link href={fireUsers.find(user => user.uid === comment.uid) ? "/users/" + fireUsers.find(user => user.uid === comment.uid).link : "#"}>
                        <a className='font-semibold'>{fireUsers.find(user => user.uid === comment.uid) ? fireUsers.find(user => user.uid === comment.uid).displayName : "Deleted Account"}</a>
                      </Link>
                      <div className='w-1 h-1 rounded-full bg-gray-400'></div>
                      <span className='text-gray-400 text-xs'>{dayjs.unix(comment.createdAt.seconds).fromNow()}</span>
                    </div>
                    <p className='text-gray-400 text-sm'>{comment.comment}</p>
                    <div className='flex items-center gap-3'>
                      <button type='button' className='flex items-center gap-2' onClick={() => likeComment(comment.id)}>
                        <AiFillLike className='fill-gray-500' />
                        <span className='text-gray-500 text-sm'>{comment.like.length} Likes</span>
                      </button>
                      <div className='w-1 h-1 rounded-full bg-gray-500'></div>
                      <span className='text-gray-500 text-sm'>Share</span>
                    </div>
                  </div>
                </div>
                ))}
                
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
