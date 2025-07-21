import React from 'react'
import { getSnippetById } from '@/lib/actions/snippet.action'
import Header from '@/components/header'
import Main from '@/components/main'
import { ViewButtons } from './view-buttons'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { ObjectId } from 'mongoose'

async function ViewSnippet({params}: {params: Promise<{id: string}>}) {
  const id = (await params).id
  const snippet = await getSnippetById(id)
  const session = await getServerSession(authOptions)
  if (!snippet) notFound()
  if (session?.user?.id !== (snippet.userId as ObjectId).toString()) notFound()
  
  return (
    <>
      <Header pageTitle={snippet.title} />
      <Main>
        <p>
          {snippet.description}
        </p>
        <pre className="bg-gray-300 p-4 rounded-md min-h-[400px]">
          <code className="text-sm text-gray-900">
            {snippet.code}
          </code>
        </pre>
        <ViewButtons id={id} />
      </Main>
    </>
  )
}

export default ViewSnippet