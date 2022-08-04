import { useState } from 'react';
import { firestore, storage } from '../../../lib/firebase';
import slugify from 'react-slugify';
import { FaPen } from 'react-icons/fa'
import { GrFormClose } from 'react-icons/gr'
import { useAuth } from '../../../context/AuthContext';
import { collection, deleteDoc, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useRouter } from 'next/router';
import Image from 'next/image';
const { DateTime } = require("luxon");

export default function AdminCategories() {

  const { changeCategoryThumb, user, toastError, categoriesArray, getCategories, toastInfo } = useAuth()

  const router = useRouter()

  const [categoryName, setCategoryName] = useState('')

  const [editCategory, setEditCategory] = useState(false)
  const [category, setCategory] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editCategoryName, setEditCategoryName] = useState('')

  const [categoryImage, setCategoryImage] = useState(null)
  const [progress, setProgress] = useState(0)



  const addCategoryThumb = (file, id) => {
    if (file && (file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png") && file.size <= 3000000) {
      
      const storageRef = ref(storage, `/categories/${id}`)

      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on("state_changed", (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)

        setProgress(prog)
      }, (err) => {
        toastError(err.message)
        updateDoc(doc(firestore, 'categories', id), {
          image: '/img/defaultBlog.png',
        })
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref)
        .then((url) => {
          updateDoc(doc(firestore, 'categories', id), {
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


  const addCategory = (e) => {
    e.preventDefault() //Normalde submit edince ? linkine atıyor ve sayfayı yeniliyor, yenilememesi için bu gerekli

    const id = categoriesArray.length+1

    addDoc(collection(firestore, 'categories'), {
      name: categoryName,
      id: id,
      createdAt: Date(),
      image: categoryImage === null && '/img/defaultBlog.png',
      link: slugify(categoryName.toLocaleLowerCase()) + "-" + id,
      filterDate: DateTime.now().toUnixInteger(),
    })

    setCategoryName('')
    

    getDocs(query(collection(firestore, 'categories'), where("id", "==", id)))
      .then((data) => {
        data.docs.map((item) => 
          categoryImage !== null && (
            addCategoryThumb(categoryImage, item.id)
          )
        )})


    getCategories()
  }


  const setEditCategoryFunc = (category) => {
    setEditCategory(true)
    setCategory(category)

    setEditCategoryId(category.id)
    setEditCategoryName(category.name)
  }



  const updateCategory = async (e) => {
    e.preventDefault() //Normalde submit edince ? linkine atıyor ve sayfayı yeniliyor, yenilememesi için bu gerekli

    //upload image

    if (categoryImage !== null) {
      changeCategoryThumb(categoryImage, editCategoryId)
    }

    updateDoc(doc(firestore, 'categories', editCategoryId), {
      name: editCategoryName,
    })


    getCategories()
    
  }




  const deleteCategory = async (id) => {

    const docRef = doc(collection(firestore, 'categories'), id)
    await deleteDoc(docRef)

    setEditCategory(false)
    
    getCategories()
  }


  return (
    <>
      <div className="w-3/4 mx-auto flex h-[85vh] py-14 justify-center gap-24">
        <div className='flex flex-col gap-6 w-2/4 overflow-y-scroll'>
        {categoriesArray.map(category =>
          <div className="flex justify-between gap-9 items-center bg-gray-100 py-6 px-7 transition-all rounded-xl hover:bg-gray-600 group" key={category.id}>
            <Image width="64px" height="64px" src={category.image} className="object-cover rounded-xl" alt="" />
            <div className="flex flex-col w-[80%] justify-center">
            <a className="text-2xl font-bold mb-1 group-hover:text-white">{category.name}</a>

            </div>
            <div className='flex items-center justify-center gap-2'>
              <button type='button' onClick={() => setEditCategoryFunc(category)} className='bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center'>
                <FaPen />
              </button>

              <button type='button' onClick={(e) => deleteCategory(category.id)} className='bg-red-500 rounded-full w-8 h-8 flex items-center justify-center'>
                <svg width="18px" height="18px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path fill="white" d="M14,3 C14.5522847,3 15,3.44771525 15,4 C15,4.55228475 14.5522847,5 14,5 L13.846,5 L13.1420511,14.1534404 C13.0618518,15.1954311 12.1930072,16 11.1479,16 L4.85206,16 C3.80698826,16 2.93809469,15.1953857 2.8579545,14.1533833 L2.154,5 L2,5 C1.44771525,5 1,4.55228475 1,4 C1,3.44771525 1.44771525,3 2,3 L5,3 L5,2 C5,0.945642739 5.81588212,0.0818352903 6.85073825,0.00548576453 L7,0 L9,0 C10.0543573,0 10.9181647,0.815882118 10.9945142,1.85073825 L11,2 L11,3 L14,3 Z M11.84,5 L4.159,5 L4.85206449,14.0000111 L11.1479,14.0000111 L11.84,5 Z M9,2 L7,2 L7,3 L9,3 L9,2 Z"/>
                </svg>
              </button>
            </div>
          </div>    
          )}
        </div>


        {!editCategory ? (
          <form className='flex flex-col gap-5 w-80' onSubmit={(e) => addCategory(e)}>
            <h2 className='text-xl font-bold text-gray-900 mb-2'>Add category</h2>
            <input type="text" className='py-3 px-6 bg-gray-100 rounded-xl' placeholder="Category name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required="required" />
            <input type="file" name="myImage" onChange={(e) => setCategoryImage(e.target.files[0])} />  
            <input type="submit" className='bg-gray-800 text-white px-6 py-4 rounded-xl text-sm font-bold' value="Add Category" />
          </form>
        ) : (
          <form className='flex flex-col gap-5 w-80' onSubmit={(e) => updateCategory(e)}>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-bold text-gray-900 mb-2'>Edit category</h2>
              <button type='button' onClick={() => setEditCategory(false)} className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center">
                <GrFormClose size={20} />
              </button> 
            </div>
            <input type="text" className='py-3 px-6 bg-gray-100 rounded-xl' placeholder="Category name" value={editCategoryName} onChange={(event) => setEditCategoryName(event.target.value)} required="required" />
            <input type="file" name="myImage" onChange={(e) => setCategoryImage(e.target.files[0])} />  
            <input type="submit" className='bg-gray-800 text-white px-6 py-4 rounded-xl text-sm font-bold' value="Save" />
          </form>
        )}
      </div>
    </>
  )
}
