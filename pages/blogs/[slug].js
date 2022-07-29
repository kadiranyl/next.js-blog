import { useRouter } from 'next/router'
import { app, database } from '../../firebaseClient';
import { collection, getDocs } from 'firebase/firestore';
import { useState, useEffect } from "react";



export default function BlogDetails() {


    //Blogları çek
    const [blogsArray, setBlogsArray] = useState([])
    const [blog, setBlog] = useState('')

    const getBlogs = () => {
        getDocs(collection(database, 'blogs'))
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



    if (blogsArray.map(blog => blog.link == slug) && blog) {
  
      return (
          <div className='w-3/4 mx-auto flex flex-col items-center my-16 gap-1'>
              <img src={"/" + blog.image} className="h-72 md:h-96 lg:h-[600px] w-full rounded object-cover mb-9" />
              <div className='flex items-center justify-center gap-3 text-gray-400 text-sm'>
                <b>{blog.category}</b>
                <div className='bg-gray-500 w-1 h-1 rounded-full'></div>
                <span>{blog.date}</span>
              </div>
              <h1 className='text-5xl font-bold text-gray-600 text-left'>{blog.title}</h1>

              <div className='flex flex-col mt-4 w-full'>
                <span className='text-lg text-left'>{blog.shortContent}</span>

                <div className='text-gray-500 mt-6 text-left text-sm' dangerouslySetInnerHTML={{ __html: blog.content }}></div>
              </div>
          </div>
      )

    } else if(blogsArray.map(blog => blog.link == slug) && !blog) {
      return (
        <div>Loading...</div>
      )
    }
    //Blogları tek tek gez router ile eşleşirse kullanıcı var olan bir sayfadadır
    
    return (
        <div>No blog found.</div>
    )

}
