import type { PropsWithChildren } from 'react';
import { Feedback } from './Feedback';
import { message } from '@/src/lib/errors';
export function QueryState({loading,error,retry,children}:PropsWithChildren<{loading:boolean;error:unknown;retry:()=>void}>) {
 if(loading)return <Feedback title="A little wander while we load…" loading />;
 if(error)return <Feedback title="Couldn’t load this just yet." detail={message(error)} retry={retry} />;
 return <>{children}</>;
}
