import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react';
import { app, database } from '../../../firebaseClient';
import { collection, deleteDoc, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';

import slugify from 'react-slugify';
const { DateTime } = require("luxon");

import 'react-quill/dist/quill.snow.css';
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });


export default function AdminBlogs() {

  const [blogTitle, setBlogTitle] = useState('')
  const [blogShortContent, setBlogShortContent] = useState('')
  const [blogContent, setBlogContent] = useState('')
  const [blogCategory, setBlogCategory] = useState('')

  const [blogsArray, setBlogsArray] = useState([])
  const [categoriesArray, setCategoriesArray] = useState([])



  const [editBlogId, setEditBlogId] = useState('')
  const [editBlogTitle, setEditBlogTitle] = useState('')
  const [editBlogShortContent, setEditBlogShortContent] = useState('')
  const [editBlogContent, setEditBlogContent] = useState('')
  const [editBlogCategory, setEditBlogCategory] = useState('')
  const [editBlogImage, setEditBlogImage] = useState('')


  const [editBlog, setEditBlog] = useState()


  //Send image to the server && new blog
  const [image, setImage] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState(null);

  const [imageUrl, setImageUrl] = useState(null);

  const uploadToClient = (event) => {
    setImageUrl(event.target.files[0].name)

    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setImage(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  const uploadToServer = async (event) => {

    const body = new FormData();
    body.append("file", image);
    const response = await fetch("/api/file", {
      method: "POST",
      body
    });
  };
  //end


  

  const getCategories = () => {
    getDocs(collection(database, 'categories'))
      .then((data) => {
        setCategoriesArray(data.docs.map((item) => {
          return { ...item.data(), id: item.id }
        }));
      })
  }

  useEffect(() => {
    getCategories();
  }, [])
  //Veriyi getProjects'dan alıyor
  const getBlogs = () => {
    getDocs(query(collection(database, 'blogs'), orderBy("filterDate")))
      .then((data) => {
        setBlogsArray(data.docs.reverse().map((item) => {
          return { ...item.data(), id: item.id }
        }));
      })
  }
  useEffect(() => {
    getBlogs();
  }, [])




  const addBlog = async (e) => {
    e.preventDefault() //Normalde submit edince ? linkine atıyor ve sayfayı yeniliyor, yenilememesi için bu gerekli

    uploadToServer()

    const date = new Date()

    addDoc(collection(database, 'blogs'), {
      title: blogTitle,
      shortContent: blogShortContent,
      content: blogContent,
      category: blogCategory,
      id: blogsArray.length + 1,
      createdAt: date,
      filterDate: DateTime.now().toUnixInteger(),
      date: date.toLocaleDateString(),
      image: imageUrl,
      link: slugify(blogTitle.toLocaleLowerCase())
    })

    setBlogTitle('')
    setBlogShortContent('')
    setBlogContent('')
    setBlogCategory('')

    getBlogs() //Yeni not eklendiğinde bu fonksiyon çalışacak
  }

  
  const deleteBlog = async (id) => {

    const docRef = doc(collection(database, 'blogs'), id)
    await deleteDoc(docRef)

    setEditBlog(false)
    getBlogs()
    
  }


  const setEditBlogFunc = (blog) => {
    setEditBlog(true)
    setCreateObjectURL('')

    setEditBlogId(blog.id)
    setEditBlogTitle(blog.title)
    setEditBlogShortContent(blog.shortContent)
    setEditBlogContent(blog.content)
    setEditBlogCategory(blog.category)
    setEditBlogImage(blog.image)
  }

  console.log(editBlogImage);
  const [newImgUrl, setNewImgUrl] = useState(editBlogImage)

  const updateBlog = (e) => {
    e.preventDefault() //Normalde submit edince ? linkine atıyor ve sayfayı yeniliyor, yenilememesi için bu gerekli

    uploadToServer()

    if (imageUrl !== editBlogImage) { //Resim eklenmiş mi eklenmemiş mi diye eskisiyle karşılaştırıyor
      //resim farklı olduğu için newImgUrl'ye yeni resmi veriyoruz
      setNewImgUrl(imageUrl)
    } else {
      setNewImgUrl(editBlogImage)
    }

    updateDoc(doc(database, 'blogs', editBlogId), {
      title: editBlogTitle,
      shortContent: editBlogShortContent,
      content: editBlogContent,
      category: editBlogCategory,
      image: newImgUrl
    })

    getBlogs()
    
  }


  return (
    <div className="w-3/4 mx-auto flex h-screen py-20 justify-center gap-24">
      <div className='flex flex-col gap-6 w-2/4 overflow-y-scroll'>
          {blogsArray.map(blog =>
          <div className="flex justify-between gap-9 items-center bg-gray-100 py-6 px-7 transition-all rounded-xl hover:bg-gray-600 group" key={blog.id}>
            <img src={"/" + blog.image} className="object-cover w-[20%] h-24 rounded-xl" />
            <div className="flex flex-col w-[80%] justify-center">
              <span className="text-blue-500 text-xs mb-2">{blog.category}</span>
                <a className="text-2xl font-bold mb-1 group-hover:text-white">{blog.title}</a>
              <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-400">{blog.shortContent && blog.shortContent.length > 50 ? blog.shortContent.slice(0, 50) + "..." : blog.shortContent}</p>
              <div className="flex justify-start rounded-lg items-center gap-2">
                <img src="https://via.placeholder.com/520x520" className="w-6 h-6 rounded-full cursor-pointer" />
                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-400">Kadir Yılmaz</span>
              </div>
            </div>
            <div className='flex items-center justify-center gap-2'>
              <button type='button' onClick={() => setEditBlogFunc(blog)} className='bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center'>
                <i className="fa-solid fa-pen"></i>
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
          {categoriesArray.map(category =>
            <option value={category.name} key={category.id}>
              {category.name}
            </option>
          )}
        </select>
        <img src={createObjectURL} className="w-16 rounded-lg" />
        <input type="file" name="myImage" onChange={(event) => uploadToClient(event)} required="required" />
        <input type="submit" className='bg-gray-800 text-white px-6 py-4 rounded-xl text-sm font-bold' value="Add" />
      </form>

      ) :
      
      <form className='flex flex-col gap-3 w-2/4 h-fit' onSubmit={(e) => updateBlog(e)}>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-bold text-gray-900 mb-2'>Edit blog</h2>

          <button type='button' onClick={() => setEditBlog()} className="bg-gray-200 w-8 h-8 rounded-full">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>


        <input type="text" className='py-3 px-6 bg-gray-100 rounded-xl' placeholder="Blog title" value={editBlogTitle} onChange={(event) => setEditBlogTitle(event.target.value)} />
        <textarea type="text" rows="5" className='py-3 px-6 bg-gray-100 rounded-xl' placeholder="Blog short content" value={editBlogShortContent} onChange={(event) => setEditBlogShortContent(event.target.value)} />

        <ReactQuill value={editBlogContent} onChange={setEditBlogContent} />


        <label htmlFor="categories" className='text-sm font-bold'>Select category</label>
        <select name="categories" onChange={(e) => setEditBlogCategory(e.target.value)}>
          {categoriesArray.map(category =>
            <option value={category.name} key={category.id}>
              {category.name}
            </option>
          )}
        </select>
        <img src={createObjectURL} className="w-16 rounded-lg" />
        <input type="file" name="myImage" onChange={(event) => uploadToClient(event)} />
        <input type="submit" className='bg-gray-800 text-white px-6 py-4 rounded-xl text-sm font-bold' value="Save" />
      </form>

      }
    </div>
  )
}
