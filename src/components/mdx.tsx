import Link from 'next/link';
import Image from 'next/image';

export function a(props: any) {
  const href = props.href;

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    );
  }

  if (href.startsWith('#')) {
    return <a {...props} />;
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

export function img(props: any) {
  return <Image {...props} />;
}

export const components = {
  a,
  img,
};