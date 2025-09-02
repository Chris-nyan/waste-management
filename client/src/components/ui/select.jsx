import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

// Trigger
const SelectTrigger = React.forwardRef(({ className, children, placeholder, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children || <span className="text-gray-400">{placeholder}</span>}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-5 w-5 opacity-60" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

// Content with search & scroll
const SelectContent = React.forwardRef(({ className, children, position = "popper", searchPlaceholder = "Search...", ...props }, ref) => {
  const [searchValue, setSearchValue] = React.useState("")

  // Filter items smd on search
  const filteredChildren = React.Children.toArray(children).filter(child =>
    child.props.children.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 w-full max-w-sm rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg animate-in fade-in-0 zoom-in-95",
          className
        )}
        position={position}
        {...props}
      >
        {/* Search input */}
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-gray-300 px-8 py-1.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Viewport with scroll */}
        <SelectPrimitive.Viewport className="max-h-60 overflow-auto p-1">
          {filteredChildren}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

// Label
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-3 py-1.5 text-sm font-small text-gray-700", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

// Item
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 px-3 text-sm text-gray-900 outline-none hover:bg-blue-50 data-[highlighted]:bg-blue-100 data-[highlighted]:text-blue-700",
      className
    )}
    {...props}
  >
    <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-blue-600" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText className="ml-6">{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

// Separator
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-px bg-gray-200", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}