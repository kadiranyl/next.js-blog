import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react';
import { firestore, storage } from '../../../lib/firebase';
import { collection, deleteDoc, getDocs, addDoc, updateDoc, doc, query, orderBy, where, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext'

import slugify from 'react-slugify';
const { DateTime } = require("luxon");

import 'react-quill/dist/quill.snow.css';
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import { FaPen } from 'react-icons/fa'
import DotLoader from "react-spinners/DotLoader";
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useRouter } from 'next/router';
import { GrFormClose } from 'react-icons/gr'
import Image from 'next/image';



export default function AdminBlogs() {
  const { user, changeBlogThumb, toastInfo, toastError, categoriesArray, deleteImg } = useAuth()

  const router = useRouter()

  const [blogTitle, setBlogTitle] = useState('')
  const [blogShortContent, setBlogShortContent] = useState('')
  const [blogContent, setBlogContent] = useState('')
  const [blogCategory, setBlogCategory] = useState('')
  const [blogsArray, setBlogsArray] = useState([])
  const [editBlogId, setEditBlogId] = useState('')
  const [editBlogTitle, setEditBlogTitle] = useState('')
  const [editBlogShortContent, setEditBlogShortContent] = useState('')
  const [editBlogContent, setEditBlogContent] = useState('')
  const [editBlogCategory, setEditBlogCategory] = useState('')
  const [editBlog, setEditBlog] = useState()
  const [blogImage, setBlogImage] = useState(null)
  const [blog, setBlog] = useState()
  const [newBlogId, setNewBlogId] = useState()
  const [progress, setProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [iid, setIid] = useState()



  useEffect(() => {
    console.log(progress);
    if (progress > 0 && progress < 100) {
      setShowProgress(true)
    } else {
      setShowProgress(false)
    }
  }, [progress])




  const getBlogs = () => {
    getDocs(query(collection(firestore, 'blogs'), orderBy("filterDate", "desc"), where("author", "==", user.uid)))
      .then((data) => {
        setBlogsArray(data.docs.map((item) => {
          return { ...item.data(), id: item.id }
        }));
      })
  }
  useEffect(() => {
    if (user) {
      getBlogs();
    }
  }, [user])


  const addBlogThumb = (file, id) => {
    if (file && (file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png") && file.size <= 3000000) {
      
      const storageRef = ref(storage, `/accounts/${user.uid}/p-${id}`)

      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on("state_changed", (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)

        setProgress(prog)
      }, (err) => {
        toastError(err.message)
        updateDoc(doc(firestore, 'blogs', id), {
          image: '/img/defaultBlog.png',
        })
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref)
        .then((url) => {
          updateDoc(doc(firestore, 'blogs', id), {
            image: url
          })
          router.reload()
        })
      })

      toastInfo("Image is uploading, don't leave from the page.")
    } else if (file.size > 3000000) {
      updateDoc(doc(firestore, 'blogs', id), {
        image: '/img/defaultBlog.png',
      })
      toastError('Image size is too big! (max 3mb)')
    } else if (file.type !== "image/jpeg" || file.type !== "image/jpg" || file.type !== "image/png") {
      updateDoc(doc(firestore, 'blogs', id), {
        image: '/img/defaultBlog.png',
      })
      toastError('You can only upload an image!')
    }
  }


  const addBlog = (e) => {
    e.preventDefault() //Normalde submit edince ? linkine atıyor ve sayfayı yeniliyor, yenilememesi için bu gerekli

    const id = blogsArray.length + 1
    const date = new Date()
    

    addDoc(collection(firestore, 'blogs'), {
      title: blogTitle,
      shortContent: blogShortContent,
      content: blogContent,
      category: blogCategory,
      id: id,
      createdAt: date,
      filterDate: DateTime.now().toUnixInteger(),
      image: blogImage === null && '/img/defaultBlog.png',
      link: slugify(blogTitle.toLocaleLowerCase()) + "-" + id,
      author: user.uid
    })


    setBlogTitle('')
    setBlogShortContent('')
    setBlogContent('')
    setBlogCategory('')

    getBlogs() //Yeni not eklendiğinde bu fonksiyon çalışacak



    getDocs(query(collection(firestore, 'blogs'), where("id", "==", id)))
      .then((data) => {
        data.docs.map((item) => 
          blogImage !== null && (
            addBlogThumb(blogImage, item.id)
          )
        )})



  }

  
  const deleteBlog = async (id) => {
    
    deleteImg(`/accounts/${user.uid}/p-${id}`)

    const docRef = doc(collection(firestore, 'blogs'), id)
    await deleteDoc(docRef)

    setEditBlog(false)
    getBlogs()
    
  }


  const setEditBlogFunc = (blog) => {
    setEditBlog(true)
    setBlog(blog)

    setEditBlogId(blog.id)
    setEditBlogTitle(blog.title)
    setEditBlogShortContent(blog.shortContent)
    setEditBlogContent(blog.content)
    setEditBlogCategory(blog.category)
    setBlogImage(null)
  }



  
  const updateBlog = async (e) => {
    e.preventDefault() //Normalde submit edince ? linkine atıyor ve sayfayı yeniliyor, yenilememesi için bu gerekli

    //upload image

    if (blogImage !== null) {
      changeBlogThumb(blogImage, editBlogId)
      getBlogs()
    }

    updateDoc(doc(firestore, 'blogs', editBlogId), {
      title: editBlogTitle,
      shortContent: editBlogShortContent,
      content: editBlogContent,
      category: editBlogCategory,
    })
    getBlogs()
    
  }


  const setEditBlogHandler = () => {
    setBlog(null)
    setEditBlog(false)

    setEditBlogId(null)
    setEditBlogTitle(null)
    setEditBlogShortContent(null)
    setEditBlogContent(null)
    setEditBlogCategory(null)
    setBlogImage(null)
  }

  return (
    <>
        {showProgress && (
          <div className='fixed top-0 left-0 h-[85vh] w-full flex items-center shadow-xl justify-center z-50'>
            <div className='bg-black rounded-xl w-72 h-72 flex items-center gap-6 justify-center flex-col'>
              <DotLoader color='white' />
              <span className='text-2xl font-bold text-white'>{progress}%</span>
            </div>
          </div>
        )}
      <div className="w-3/4 mx-auto flex h-[85vh] py-14 justify-center gap-24">

        <div className='flex flex-col gap-6 w-2/4 overflow-y-scroll'>
        <h2 className='text-xl font-bold text-gray-900 mb-2'>Your blogs</h2>

            {blogsArray.map(blog =>
            <div className="flex justify-between gap-9 items-center bg-gray-100 py-6 px-7 transition-all rounded-xl hover:bg-gray-600 group" key={blog.id}>
              <Image width="200px" height="200px" src={blog.image} className="object-cover rounded-xl" alt="" />
              <div className="flex flex-col w-[80%] justify-center">
              <span className="text-black border-2 font-bold uppercase border-black group-hover:border-white group-hover:text-white w-fit px-3 py-[5px] text-xs mb-2">{categoriesArray.find(category => category.id === blog.category) ? categoriesArray.find(category => category.id === blog.category).name : "Deleted Category"}</span>
                  <a className="text-2xl font-bold mb-1 group-hover:text-white">{blog.title}</a>
                <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-400">{blog.shortContent && blog.shortContent.length > 50 ? blog.shortContent.slice(0, 50) + "..." : blog.shortContent}</p>

              </div>
              <div className='flex items-center justify-center gap-2'>
                <button type='button' onClick={() => setEditBlogFunc(blog)} className='bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center'>
                  <FaPen />
                </button>

                <button type='button' onClick={(e) => deleteBlog(blog.id)} className='bg-red-500 rounded-full w-8 h-8 flex items-center justify-center'>
                  <svg width="18px" height="18px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path fill="white" d="M14,3 C14.5522847,3 15,3.44771525 15,4 C15,4.55228475 14.5522847,5 14,5 L13.846,5 L13.1420511,14.1534404 C13.0618518,15.1954311 12.1930072,16 11.1479,16 L4.85206,16 C3.80698826,16 2.93809469,15.1953857 2.8579545,14.1533833 L2.154,5 L2,5 C1.44771525,5 1,4.55228475 1,4 C1,3.44771525 1.44771525,3 2,3 L5,3 L5,2 C5,0.945642739 5.81588212,0.0818352903 6.85073825,0.00548576453 L7,0 L9,0 C10.0543573,0 10.9181647,0.815882118 10.9945142,1.85073825 L11,2 L11,3 L14,3 Z M11.84,5 L4.159,5 L4.85206449,14.0000111 L11.1479,14.0000111 L11.84,5 Z M9,2 L7,2 L7,3 L9,3 L9,2 Z"/>
                  </svg>
                </button>
              </div>
            </div>    
            )}
        </div>


        {!editBlog ? (

        <form className='flex flex-col gap-3 w-2/4 h-fit' onSubmit={(e) => addBlog(e)}>
          <h2 className='text-xl font-bold text-gray-900 mb-2'>Add blog</h2>

          <input type="text" className='py-3 px-6 bg-gray-100 rounded-xl' placeholder="Blog title" value={blogTitle} onChange={(event) => setBlogTitle(event.target.value)} required="required" />
          <textarea type="text" rows="5" className='py-3 px-6 bg-gray-100 rounded-xl' placeholder="Blog short content" value={blogShortContent} onChange={(event) => setBlogShortContent(event.target.value)} required="required" />

          <ReactQuill value={blogContent} onChange={setBlogContent} />


          <label htmlFor="categories" className='text-sm font-bold'>Select category</label>
          <select name="categories" onChange={(e) => setBlogCategory(e.target.value)} required="required">
              <option value="Select a category" defaultChecked>
                Select a category
              </option>
            {categoriesArray.map(category =>
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            )}
          </select>
          <input type="file" name="image" onChange={(e) => setBlogImage(e.target.files[0])} />
          <input type="submit" className='bg-gray-800 text-white px-6 py-4 rounded-xl text-sm font-bold' value="Add" />
        </form>

        ) :
        
        <form className='flex flex-col gap-3 w-2/4 h-fit' onSubmit={(e) => updateBlog(e)}>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold text-gray-900 mb-2'>Edit blog</h2>

            <button type='button' onClick={() => setEditBlogHandler()} className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center">
                <GrFormClose size={20} />
              </button> 
          </div>


          <input type="text" className='py-3 px-6 bg-gray-100 rounded-xl' placeholder="Blog title" value={editBlogTitle} onChange={(event) => setEditBlogTitle(event.target.value)} />
          <textarea type="text" rows="5" className='py-3 px-6 bg-gray-100 rounded-xl' placeholder="Blog short content" value={editBlogShortContent} onChange={(event) => setEditBlogShortContent(event.target.value)} />

          <ReactQuill value={editBlogContent} onChange={setEditBlogContent} />


          <label htmlFor="categories" className='text-sm font-bold'>Select category</label>
          <select name="categories" onChange={(e) => setEditBlogCategory(e.target.value)}>
            <option value="Select a category" defaultChecked>
                Select a category
              </option>
            {categoriesArray.map(category =>
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            )}
          </select>
          <input type="file" name="image" onChange={(e) => setBlogImage(e.target.files[0])} />
          <input type="submit" className='bg-gray-800 text-white px-6 py-4 rounded-xl text-sm font-bold' value="Save" />
        </form>

        }
      </div>
    </>
  )
}
