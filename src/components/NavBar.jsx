import civicIntelLogo from "../assets/civicintellogo1.png"
function NavBar(){
    return(
        <header class="w-full bg-[#0B3C5D] text-white shadow-md ">
            <div class="p-2 mx-auto max-w-7xl sm:px-6 lg:px-8 ">

               {/* Main navbar  */}
                <div class="flex items-center justify-between gap-6 min-h-20 ">

                {/* Logo  */}
                <a
                    href="/"
                    class="flex items-center gap-3 shrink-0"
                    aria-label="Civic Intel home"
                >
                    <img
                    src={civicIntelLogo}
                    alt="Civic Intel logo"
                    class="h-12 w-auto max-w-62.5 object-contain bg-white/55 rounded-md p-2"
                    />
                </a>

                {/* Desktop navigation  */}
                <nav
                    aria-label="Main navigation"
                    class="items-center justify-center flex-1 hidden lg:flex"
                >
                    <ul class="flex items-center gap-1 xl:gap-3">

                    <li>
                        <a
                        href="/"
                        aria-current="page"
                        class="px-3 py-2 text-sm font-semibold text-white transition-colors rounded-md hover:bg-white/10 first:text-[#1F7A3F]"
                        >
                        Home
                        </a>
                    </li>

                    <li>
                        <a
                        href="/health"
                        class="px-3 py-2 text-sm transition-colors rounded-md text-white/90 hover:bg-white/10 hover:text-white"
                        >
                        Health
                        </a>
                    </li>

                    <li>
                        <a
                        href="/education"
                        class="px-3 py-2 text-sm transition-colors rounded-md text-white/90 hover:bg-white/10 hover:text-white"
                        >
                        Education
                        </a>
                    </li>

                    <li>
                        <a
                        href="/governance"
                        class="px-3 py-2 text-sm transition-colors rounded-md text-white/90 hover:bg-white/10 hover:text-white"
                        >
                        Governance
                        </a>
                    </li>

                    <li>
                        <a
                        href="/states"
                        class="px-3 py-2 text-sm transition-colors rounded-md text-white/90 hover:bg-white/10 hover:text-white"
                        >
                        States
                        </a>
                    </li>

                    <li>
                        <a
                        href="/explore"
                        class="px-3 py-2 text-sm transition-colors rounded-md text-white/90 hover:bg-white/10 hover:text-white"
                        >
                        Explore
                        </a>
                    </li>

                    <li>
                        <a
                        href="/sources-and-methods"
                        class="px-3 py-2 text-sm transition-colors rounded-md whitespace-nowrap text-white/90 hover:bg-white/10 hover:text-white"
                        >
                        Sources &amp; Methods
                        </a>
                    </li>

                    </ul>
                </nav>

                {/* Desktop authentication actions  */}
                <div class="items-center hidden gap-3 shrink-0 lg:flex">

                    <a
                    href="/signup"
                    class="inline-flex items-center gap-2 rounded-full
                            bg-[#1F7A3F] px-5 py-2.5 text-sm font-semibold
                            text-white transition-colors
                            hover:bg-[#176331]"
                    >
                    Sign Up

                    <span class="inline-flex items-center justify-center w-6 h-6 bg-white rounded-full">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#0B3C5D"
                            stroke-width="1.8"
                            class="w-4 h-4"
                            aria-hidden="true"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M4.5 12h15m-7.5-7.5L19.5 12 12 19.5"
                            />
                        </svg>
                    </span>
                    </a>

                    <a
                    href="/login"
                    class="px-4 py-2 text-base font-medium transition-colors border rounded-full border-white/50 hover:bg-white/10"
                    >
                    Log In
                    </a>

                    

                </div>

                {/* Mobile menu */}
                <details class="relative lg:hidden">

                    <summary
                    aria-label="Toggle navigation menu"
                    class="flex h-11 w-11 cursor-pointer list-none
                            items-center justify-center rounded-lg
                            border border-white/30 transition-colors
                            hover:bg-white/10
                            [&::-webkit-details-marker]:hidden"
                    >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.8"
                        class="w-6 h-6"
                        aria-hidden="true"
                    >
                        <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                    </summary>

                    <nav
                    aria-label="Mobile navigation"
                    class="absolute right-0 top-14 z-50 w-72
                            max-w-[calc(100vw-2rem)] rounded-xl
                            border border-white/10 bg-[#0B3C5D]
                            p-4 shadow-xl"
                    >
                    <ul class="flex flex-col gap-1">

                        <li>
                        <a
                            href="/"
                            aria-current="page"
                            class="block px-4 py-3 font-semibold text-white rounded-lg bg-white/10"
                        >
                            Home
                        </a>
                        </li>

                        <li>
                        <a
                            href="/health"
                            class="block px-4 py-3 rounded-lg hover:bg-white/10"
                        >
                            Health
                        </a>
                        </li>

                        <li>
                        <a
                            href="/education"
                            class="block px-4 py-3 rounded-lg hover:bg-white/10"
                        >
                            Education
                        </a>
                        </li>

                        <li>
                        <a
                            href="/governance"
                            class="block px-4 py-3 rounded-lg hover:bg-white/10"
                        >
                            Governance
                        </a>
                        </li>

                        <li>
                        <a
                            href="/states"
                            class="block px-4 py-3 rounded-lg hover:bg-white/10"
                        >
                            States
                        </a>
                        </li>

                        <li>
                        <a
                            href="/explore"
                            class="block px-4 py-3 rounded-lg hover:bg-white/10"
                        >
                            Explore
                        </a>
                        </li>

                        <li>
                        <a
                            href="/sources-and-methods"
                            class="block px-4 py-3 rounded-lg hover:bg-white/10"
                        >
                            Sources &amp; Methods
                        </a>
                        </li>

                    </ul>

                    <div class="flex flex-col gap-3 pt-4 mt-4 border-t border-white/20">

                        <a
                        href="/signup"
                        class="rounded-full bg-[#1F7A3F] px-4 py-3
                                text-center font-semibold
                                hover:bg-[#176331]"
                        >
                        Sign Up →
                        </a>

                        <a
                        href="/login"
                        class="px-4 py-3 font-medium text-center border rounded-full border-white/40 hover:bg-white/10"
                        >
                        Log In
                        </a>

                        

                    </div>
                    </nav>

                </details>

                </div>
            </div>
        </header>
    )   
}
export default NavBar