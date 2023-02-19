import { Fragment } from 'react'
import cx from "classnames";
import { Menu, Transition } from '@headlessui/react'
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ChevronDownIcon,
  UserPlusIcon,
} from '@heroicons/react/20/solid'

export enum Direction {
  ltr = "left-to-right",
  rtl = "right-to-left",
  ttb = "top-to-bottom",
  btt = "bottom-to-top",
}

const items = [
  {
    icon: ArrowRightCircleIcon,
    value: Direction.ltr,
    label: "Left to Right",
  },
  {
    icon: ArrowLeftCircleIcon,
    value: Direction.rtl,
    label: "Right to Left",
  },
  {
    icon: ArrowDownCircleIcon,
    value: Direction.ttb,
    label: "Top to Bottom",
  },
  {
    icon: ArrowUpCircleIcon,
    value: Direction.btt,
    label: "Bottom to Top",
  },
]

export default function DirectionDropdown({
  isDisabled = false,
  setValue,
  value,
}: {
  isDisabled: boolean,
  setValue: (dir: Direction) => void,
  value: string,
}) {
  const selected = items.find((i) => i.value === value);

  return (
    <Menu
      as="div"
      className="relative inline-block text-left"
    >
      <div>
        <Menu.Button
          className={cx(
            "inline-flex items-center w-full justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-100",
            isDisabled ? "bg-slate-100" : "bg-white hover:bg-slate-50"
          )}
          disabled={isDisabled}
        >
          {selected ? (
            <>
              <selected.icon className="h-4 w-4 mr-2" />
              {selected.label}
            </>
          ) : (
            <span>Options</span>
          )}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right divide-y divide-slate-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {items.map((item) => (
              <Menu.Item key={item.value}>
                {({ active }) => (
                  <li
                    onClick={() => setValue(item.value)}
                    className={cx(
                      active ? 'bg-indigo-100 text-slate-900' : 'text-slate-700',
                      'group flex items-center px-4 py-2 text-sm hover:cursor-pointer'
                    )}
                  >
                    <>
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </>
                  </li>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
