import React from "react"
import { Chat } from "../Chat"

export default function Messages() {
  return (
    <div className="p-3 sm:p-4 md:p-6 w-full max-w-full mx-0">
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 mb-6 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-white/90">Stay connected with vendors and planners for your events</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mt-20 -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -mb-20 -ml-20"></div>
      </div>

      <div className="h-[calc(100vh-300px)] bg-white rounded-lg shadow">
        <Chat />
      </div>
    </div>
  )
}