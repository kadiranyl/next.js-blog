import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react';
import { app, database } from '../../../firebaseClient';
import { collection, deleteDoc, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import slugify from 'react-slugify';


export default function AdminCategories() {


  const [categoryName, setCategoryName] = useState('')

  const [categoriesArray, setCategoriesArray] = useState([])

  //Send image to the server
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
    getDocs(collection(database, 'categories')) //collectiondan 'categoriesi al
    .then((data) => { //sonra data değerini al, fonksiyonu çalıştır
    setCategoriesArray(data.docs.map((item) => { //kategorilerin olacağı categoriesArray'e datayı ekle
          return { ...item.data(), id: item.id }
        }));
      })
  }

  useEffect(() => {
    getCategories(); //Kullanıcı siteye girdiğinde çalışacak
  }, [])



  const addCategory = (e) => {
    e.preventDefault() //Normalde submit edince ? linkine atıyor ve sayfayı yeniliyor, yenilememesi için bu gerekli

    uploadToServer()

    const id = categoriesArray.length+1

    addDoc(collection(database, 'categories'), {
      name: categoryName,
      id: id,
      createdAt: Date(),
      image: imageUrl,
      link: slugify(categoryName.toLocaleLowerCase())
    })

    setCategoryName('')
    
    getCategories() //Yeni not eklendiğinde bu fonksiyon çalışacak
  }


  return (
    <div className="h-screen w-full flex items-center justify-center">
        <form className='flex flex-col gap-3 w-80' onSubmit={(e) => addCategory(e)}>
          <input type="text" className='py-3 px-6 bg-gray-100 rounded-xl' placeholder="Category name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required="required" />
          <img src={createObjectURL} className="w-16 rounded-lg" />
          <input type="file" name="myImage" onChange={(event) => uploadToClient(event)} />  
          <input type="submit" className='bg-gray-800 text-white px-6 py-4 rounded-xl text-sm font-bold' value="Add Category" />
        </form>
    </div>
  )
}
