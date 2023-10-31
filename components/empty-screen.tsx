import { UseChatHelpers } from 'ai/react'

import Image from 'next/image'
import jasonPhoto from 'public/jason-icon.png'

const exampleMessages = [
  {
    heading: 'Explain technical concepts',
    message: `What is a "serverless function"?`
  },
  {
    heading: 'Summarize an article',
    message: 'Summarize the following article for a 2nd grader: \n'
  },
  {
    heading: 'Draft an email',
    message: `Draft an email to my boss about the following: \n`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col justify-center items-center rounded-lg border bg-background p-8">
        <div className={'flex justify-center items-center mb-2'}>
          <Image
            src={jasonPhoto}
            alt={'Photo of the patient'}
            className={'w-48 h-48 rounded-lg'}
          />
        </div>
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to Sales Simulator!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          For this case you will be visiting Jason Brody, a 32 year-old
          executive, Head of Procurement in a large hospital, who has been
          referred to you as a possible lead to by your product.
        </p>
        {/*<p className="leading-normal text-muted-foreground">*/}
        {/*    */}
        {/*</p>*/}
      </div>
    </div>
  )
}
