import { useEffect, useState } from "react"
import { useAuth } from '../context/AuthContext'
import { firestore } from '../lib/firebase'
import { collection, getDocs, where, query } from 'firebase/firestore';
import Link from "next/link";
import { useRouter } from "next/router";
import { GoUnverified } from 'react-icons/go'
import { HiOutlineLogout } from 'react-icons/hi'
import Image from "next/image";

export default function Profile({ isAdmin, fireUser }) {
  const { update, socialMediaUpdate, user, handlePassUpdate, logout, handleVerification, uploadProfileImage } = useAuth()

  const router = useRouter()

//   if (!user) {
//     router.push("/login")
//   } else {

  const [displayName, setDisplayName] = useState('')
  const [biography, setBiography] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [tab, setTab] = useState('update-account')

  const [blogs, setBlogs] = useState([])
  const [profilePhoto, setProfilePhoto] = useState(null)

  useEffect(() => {

    if (fireUser) {
        setDisplayName(user.displayName)

        setBiography(fireUser.biography)
        setFacebook(fireUser.socialMedia.facebook)
        setInstagram(fireUser.socialMedia.instagram)
        setTwitter(fireUser.socialMedia.twitter)
    }



  }, [fireUser])


  //Blogları al
const getBlogs = () => {
    //desc tersten sıralaması için
      getDocs(query(collection(firestore, 'blogs'), where("author", "==", user.uid)))
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
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault("/")

    await update({
        displayName,
        biography
    })

    router.push("/profile-settings")
  }

  const handleSocialMediaSubmit = async (e) => {
    e.preventDefault("/")

    await socialMediaUpdate({
        facebook,
        instagram,
        twitter
    })

    router.push("/profile-settings")
  }

  const handleNewPass = async (e) => {
    e.preventDefault()

    await handlePassUpdate(newPassword)

    setNewPassword('')
  }



  useEffect(() => {
        if (profilePhoto) {
            uploadProfileImage(profilePhoto)
        }
    }, [profilePhoto])


    if (user !== null) {
  return (
    <>
        <div className={"h-" + (isAdmin ? "[85vh]" : "[90vh]") + " w-3/4 mx-auto flex flex-col items-center justify-start py-10 gap-4"}>
            {!user.emailVerified && (
                <button onClick={handleVerification} className="mb-8 bg-orange-400 text-white text-sm w-96 py-4 rounded-lg">
                    Your account is not verified.
                    <p className="text-base font-semibold mt-1 text-white">Click to verify</p>
                </button>
            )}
            <div className="bg-gray-100 w-96 py-8 rounded-lg flex items-center justify-between px-6 gap-14">
                <div className="flex items-center justify-center gap-4">
                    <div className="transition-all relative w-16 h-16">
                        <label htmlFor="file">
                            <Image layout="fill" className="h-16 w-16 object-cover rounded-full cursor-pointer" src={user.photoURL} alt="" />
                            <input id="file" type="file" className='hidden' onChange={(e) => setProfilePhoto(e.target.files[0])} />
                        </label>
                    </div>
                    <div className="flex flex-col justify-center">
                        <Link href={fireUser ? '/users/' + fireUser.link : ''}>
                        <h4 className="font-bold cursor-pointer flex items-center gap-2">
                            {user.displayName}
                            {!user.emailVerified && (
                                <GoUnverified color="gray" />
                            )}
                        </h4>
                        </Link>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                </div>
                <button type="button" onClick={() => logout()} className="bg-red-500 p-2 rounded-full group">
                <HiOutlineLogout color="white" />
                </button>
            </div>

                

                <div className="flex items-center justify-center gap-4 text-gray-400 mt-8">
                    <button onClick={() => setTab("update-account")} className={tab == "update-account" && "border-b-2 font-semibold py-1 border-b-gray-600 rounded-md text-gray-600"}>Update Account</button>
                    <button onClick={() => setTab("social-media")} className={tab == "social-media" && "border-b-2 font-semibold py-1 border-b-gray-600 rounded-md text-gray-600"}>Social Media</button>
                    <button onClick={() => setTab("change-password")} className={tab == "change-password" && "border-b-2 font-semibold py-1 border-b-gray-600 rounded-md text-gray-600"}>Change Password</button>
                </div>

                {tab === "update-account" && (
                <div className="rounded-lg flex flex-col w-96 justify-center gap-3">
                    <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Enter display name"
                            className="px-1 rounded-md py-2 bg-gray-100 text-gray-400 pl-4 valid:text-gray-600"
                            onChange={(e) => setDisplayName(e.target.value)}
                            value={displayName} />

                        <textarea rows={5}
                            type="text"
                            placeholder="Enter your biography"
                            className="px-1 rounded-md py-2 bg-gray-100 text-gray-400 pl-4 valid:text-gray-600"
                            onChange={(e) => setBiography(e.target.value)}
                            value={biography} />

                        <input type="submit" value="Update" className="bg-gray-900 px-4 py-2 text-white rounded-lg text-sm font-semibold" />
                    </form>
                </div>
                )}

                {tab === "social-media" && (
                <div className="rounded-lg flex flex-col w-96 justify-center gap-3">
                    <form className='flex flex-col gap-3' onSubmit={handleSocialMediaSubmit}>

                        <input
                            type="text"
                            placeholder="Enter your facebook"
                            className="px-1 rounded-md py-2 bg-gray-100 text-gray-400 pl-4 valid:text-gray-600"
                            onChange={(e) => setFacebook(e.target.value)}
                            value={facebook} />

                        <input
                            type="text"
                            placeholder="Enter your instagram"
                            className="px-1 rounded-md py-2 bg-gray-100 text-gray-400 pl-4 valid:text-gray-600"
                            onChange={(e) => setInstagram(e.target.value)}
                            value={instagram} />

                        <input
                            type="text"
                            placeholder="Enter your twitter"
                            className="px-1 rounded-md py-2 bg-gray-100 text-gray-400 pl-4 valid:text-gray-600"
                            onChange={(e) => setTwitter(e.target.value)}
                            value={twitter} />

                        <input type="submit" value="Update" className="bg-gray-900 px-4 py-2 text-white rounded-lg text-sm font-semibold" />
                    </form>
                </div>
                )}
                
                {tab === "change-password" && (
                    <div className="rounded-lg flex flex-col w-96 justify-center gap-3">
                        <form className='flex flex-col gap-3' onSubmit={(e) => handleNewPass(e)}>

                            <input
                                type="password"
                                placeholder="Your new password"
                                required
                                className="px-1 rounded-md py-2 bg-gray-100 text-gray-400 pl-4"
                                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                />

                            <input type="submit" disabled={!newPassword} value="Change Password" className="bg-gray-900 px-4 py-2 text-white rounded-lg text-sm font-semibold disabled:opacity-30 transition" />
                        </form>
                    </div>
                )}

        </div>
    </>
  )
                }
}
// }
