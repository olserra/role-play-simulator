import { Configuration, OpenAIApi } from 'openai-edge'

import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import { currentUser } from '@clerk/nextjs'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

const initialSystemMessages = [
  {
    role: 'system',
    content:
      'You are evaluating a conversation between buyer and seller with the goal of providing feedback to the seller about their performance.'
  },
  {
    role: 'system',
    content:
      'Here is the background information on the buyer: ' +
      `Jason Brody, a seasoned executive with over two decades of experience in the healthcare industry, has been a key figure at St. Michael's Hospital, renowned for his strategic procurement decisions that have significantly elevated the hospital's operational efficiency. Recognized for his sharp business acumen and deep understanding of the ever-evolving healthcare landscape, Jason has consistently fostered strong partnerships with innovative pharmaceutical companies, ensuring that the hospital stays at the forefront of cutting-edge medical advancements. Known for his meticulous approach and unwavering commitment to quality patient care, Jason's endorsement of a product carries substantial weight within the industry, making him a highly sought-after lead for companies looking to make a meaningful impact in the healthcare market.`
  },
  {
    role: 'system',
    content: `Use the following evaluation framework and criteria to give feedback:
  
  **Established rapport:** Adequate. The sales representative initiated the conversation with a warm greeting and maintained a friendly tone throughout, creating a welcoming environment for further discussion.
  
  **Elicits Buyer's understanding of the product:** Superior. The representative skillfully engaged Jason in a discussion about the product's features and benefits, encouraging him to share his insights and experiences related to similar products in the past.
  
  **Answers questions/delivers information appropriately:** Superior. The representative provided clear and comprehensive responses to Jason's inquiries, demonstrating a strong understanding of the product's intricacies and its relevance to the pharmaceutical landscape.
  
  **Avoids technical jargon and complex terminology:** Adequate. While mostly successful in simplifying complex concepts, there were moments where industry-specific terminology was used without sufficient clarification, potentially leading to mild confusion.
  
  **Checks for understanding, invites response:** Marginal. Although the representative periodically sought Jason's input, there were instances where the conversation appeared slightly one-sided, necessitating a more deliberate effort to encourage active participation.
  
  **Responds appropriately to objections and concerns:** Adequate. While the representative effectively addressed Jason's initial concerns, there was room for improvement in addressing potential objections proactively, offering preemptive solutions to mitigate any reservations.
  
  **Demonstrates appropriate attitude (e.g., professional, empathetic):** Superior. The representative maintained a professional demeanor and exhibited genuine empathy toward Jason's potential needs and challenges, fostering a sense of trust and understanding.
  
  **Assesses for current product needs and preferences:** Marginal. While some aspects of Jason's specific needs were explored, there was a missed opportunity to delve deeper into his precise requirements, potentially tailoring the presentation more effectively to his unique demands.
  
  **Assesses for potential industry challenges and opportunities:** Inadequate. The representative did not sufficiently explore the current challenges faced by Jason's organization, missing an opportunity to position the product as a strategic solution to existing industry hurdles.
  
  **Suggests potential ways the product can address specific needs:** Superior. The representative adeptly highlighted how the product could effectively address several of Jason's requirements, showcasing a clear understanding of the product's capabilities and its potential impact on Jason's operations.
  
  Please ensure to incorporate these suggestions to improve overall interaction and to enhance the understanding of the product's value proposition for Jason's specific requirements.`
  }
]
export async function POST(req: Request) {
  const json = await req.json()
  const { messages } = json

  const chatHistoryMessage = {
    role: 'user',
    content: messages
      .map(
        (message: Message) =>
          `${message.role === 'assistant' ? 'Patient: ' : 'Doctor: '}:${
            message.content
          }`
      )
      .join('\n')
  }

  const fullMessages = initialSystemMessages.concat(chatHistoryMessage)
  const userId = (await currentUser())?.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }
  try {
    const res = await openai.createChatCompletion({
      model: 'gpt-4',
      // @ts-ignore
      messages: fullMessages,
      temperature: 0.0,
      stream: true
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(res)

    // Respond with the stream
    return new StreamingTextResponse(stream)
  } catch (e) {
    console.log('error getting a response')
    console.log(e)
  }
}
