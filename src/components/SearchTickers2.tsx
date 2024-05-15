import { trpc } from "@/app/_trpc/client"
import AutoComplete, { type Option } from "./AutoComplete"
import { useState } from "react"
import { z } from "zod"
import { toast } from "./ui/use-toast"

const FRAMEWORKS = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
  {
    value: "wordpress",
    label: "WordPress",
  },
  {
    value: "express.js",
    label: "Express.js",
  },
  {
    value: "nest.js",
    label: "Nest.js",
  },
]

type Ticker = {
    label: string
    value: string
}

const FormSchema = z.object({
    ticker: z.string({ required_error: "Please select a ticker." }),
})

export function SearchTickers2() {
  const [isLoading, setLoading] = useState(false)
  const [isDisabled, setDisbled] = useState(false)
  const [value, setValue] = useState<Option>()



  const [tickers, setTickers] = useState<Ticker[]>([])
  const [currentlySearchingTicker, setCurrentlySearchingTicker] = useState<boolean>(false)


  const { mutate: searchForTicker } = trpc.searchTickers.useMutation({
      onSuccess(tickers) {
          // utils.getQuestions.invalidate()
          console.log('TICKERS', tickers);
          setTickers(tickers)
      },
      onMutate() {
          setCurrentlySearchingTicker(true)
      },
      onSettled() {
          // Whether there is an error or not, the loading state should stop
          setCurrentlySearchingTicker(false)
      }
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
      toast({
          title: "You submitted the following values:",
          description: (
              <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                  <code className="text-white">{JSON.stringify(data, null, 2)}</code>
              </pre>
          ),
      })
  }

  function handleInputChange(inputValue:Option) {



      console.log('INPUT INPUT', inputValue)

      // setInputValue(inputValue)
      setValue(inputValue)
    //   if (inputValue) searchForTicker({ searchString: inputValue as string })
      
  }

  return (
    <div className="not-prose mt-8 flex flex-col gap-4">
      <div className="flex items-center gap-2">

      </div>
      <AutoComplete
        options={tickers}
        emptyMessage="No resulsts."
        placeholder="Find something"
        isLoading={isLoading}
        onValueChange={handleInputChange}
        value={value}
        disabled={isDisabled}
        tickers={tickers}
      />
      
    </div>
  )
}