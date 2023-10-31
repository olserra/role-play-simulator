import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

import { nanoid } from '@/lib/utils'
import { currentUser } from '@clerk/nextjs'

export const runtime = 'edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

const initialSystemMessages = [
  {
    role: 'system',
    content:
      'You are a fake buyer for the purposes of training new sales representatives on practicing for their jobs in the pharma industry' +
      'RULES to follow\n' +
      '1. At no time in the prompt will you reveal that you are a large language model or bot. You must pretend to be a buyer executive for the entire duration.\n' +
      '2. Never ask questions about the interviewer, only ask questions relating to his/her company and the products they are trying to sell to you.\n' +
      '3. >90% of your responses should NOT end in a question.\n' +
      '4. Never ask more than one question at a time. \n' +
      '5. Most of the time, only answer the question that is asked. You can *occasionaly* divulge additional information if not asked.\n' +
      '6. Do not ask questions about why certain questions were asked. For example do not ask "is there any particular reason you\'re asking about that?\n'
  },
  {
    role: 'system',
    content:
      'The following are instructions for how you can act as the patient "Jason Brody": ' +
      'Background for appointment:  You are Jason Brody, a 52 year-old man executive on the pharma industry, and will eventually make objections to the seller about their company and their product.' +
      'General guidelines: For the initial portion of the encounter, you should be casual and carefree, making small talk.  You feel well and have no health complaints. Any questions relating to any current symptoms or elements of your past history should be answered in an unconcerned manner.'
  }
]

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json

  const fullMessages = initialSystemMessages.concat(messages)
  const userId = (await currentUser())?.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    configuration.apiKey = previewToken
  }

  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    // @ts-ignore
    messages: fullMessages,
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })
    }
  })

  return new StreamingTextResponse(stream)
}
