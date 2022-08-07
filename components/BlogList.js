import Link from "next/link"
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
import Image from "next/image";
// import 'dayjs/locale/tr'

export default function BlogList({filteredBlogsArray, fireUsers, categoriesArray, changeFilter}) {
    dayjs.extend(relativeTime)

    // dayjs.locale('tr') 

  return (
    <>
      <div className="flex flex-col gap-6 md:gap-12 w-full relative md:overflow-y-scroll md:w-[70%] md:pr-32">
        
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

          <span className="text-gray-800"><b>{filteredBlogsArray.length}</b> {filteredBlogsArray.length === 1 ? "blog" : "blogs"} found</span>
        </div>

    {filteredBlogsArray.length>0 ?
        <div className="flex flex-col gap-9">
        
        {filteredBlogsArray.map(blog => (
          <div className="flex justify-between gap-9 items-center" key={blog.id}>
            <Link href={"/blogs/" + blog.link}>
              <a className="w-24 md:w-48 flex items-center justify-center h-48">
                <Image width="200px" height="200px" src={blog.image} className="object-cover rounded-xl md:h-full" alt="" />
              </a>
            </Link>
            <div className="flex flex-col w-[70%] justify-center">
            <Link href={categoriesArray.find(category => category.id === blog.category) ? "/categories/" + categoriesArray.find(category => category.id === blog.category).link : "#"}>
              <a className="text-black border-2 font-bold uppercase border-black cursor-pointer w-fit px-3 py-[5px] text-xs mb-2">{categoriesArray.find(category => category.id === blog.category) ? categoriesArray.find(category => category.id === blog.category).name : "Deleted Category"}</a>
            </Link>
              <Link href={"/blogs/" + blog.link}>
                <a className="text-2xl font-bold mb-1">{blog.title}</a>
              </Link>
              <p className="text-gray-400 text-sm mb-6">{blog.shortContent && blog.shortContent.length > 200 ? blog.shortContent.slice(0, 200) + "..." : blog.shortContent}</p>
              <div className="flex justify-start rounded-lg items-center gap-3">
                <Link href={fireUsers.find(user => user.uid === blog.author) ? "/users/" + fireUsers.find(user => user.uid === blog.author).link : "#"}>
                  <a className="flex items-center">
                    <Image width="32px" height="32px" src={fireUsers.find(user => user.uid === blog.author) ? fireUsers.find(user => user.uid === blog.author).imageUrl : "/img/defaultUser.jpeg"} className="rounded-full cursor-pointer" alt="" />
                  </a>
                </Link>
                <div className="flex flex-col justify-center">
                  <Link href={fireUsers.find(user => user.uid === blog.author) ? "/users/" + fireUsers.find(user => user.uid === blog.author).link : "#"}>
                    <a className="text-sm font-semibold text-gray-600">{fireUsers.find(user => user.uid === blog.author) ? fireUsers.find(user => user.uid === blog.author).displayName : "Deleted Account"}</a>
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
    </>
  )
}
