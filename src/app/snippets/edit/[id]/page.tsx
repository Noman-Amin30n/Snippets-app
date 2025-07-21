import React from 'react'
import { getSnippetById } from '@/lib/actions/snippet.action'
import EditForm from './edit-form'
import { type fieldTypes } from './edit-form'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { ObjectId } from 'mongoose'

async function Edit({params}: {params: Promise<{id: string}>}) {
    const id = (await params).id
    const res = await getSnippetById(id);
    if (!res) notFound();
    const session = await getServerSession(authOptions);
    const snippet: fieldTypes = {
        title: res.title,
        description: res.description || '',
        code: res.code
    }
    if (session?.user?.id !== (res.userId as ObjectId).toString()) notFound();
  return (
    <EditForm id={id} snippet={snippet} />
  )
}

export default Edit