import { router,useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { TripForm } from './TripForm';
import { travelRepository } from '@/src/repositories/travel-repository';
export function CreateTripScreen(){
 const {destinationId}=useLocalSearchParams<{destinationId?:string}>();
 return <Screen><Heading back title="Make “someday” a date." eyebrow="Start something good" /><TripForm destinationId={destinationId} onSubmit={async input=>{const id=await travelRepository.createTrip(input);router.replace({pathname:'/trip/[tripId]',params:{tripId:id}});}} /></Screen>;
}
