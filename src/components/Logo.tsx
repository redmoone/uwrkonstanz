import Image from 'next/image'

export function Logo() {
  return (
    <div className="brand">
      <Image
        className="brand__logo"
        src="/images/uwr/logo.svg"
        alt="UWR Konstanz"
        width={1254}
        height={1254}
      />
    </div>
  )
}
