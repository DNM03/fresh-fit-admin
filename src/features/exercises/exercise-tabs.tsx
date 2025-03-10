import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ExerciseTabs() {
  return (
    <Tabs defaultValue="plans" className="gap-0">
      <TabsList className="bg-transparent w-full">
        <TabsTrigger value="plans">Exercise Plans</TabsTrigger>
        <TabsTrigger value="sets">Exercise Sets</TabsTrigger>
        <TabsTrigger value="exercises">Exercises</TabsTrigger>
      </TabsList>
      <hr />
      <TabsContent value="plans">Exercise Plans</TabsContent>
      <TabsContent value="sets">Exercise Sets</TabsContent>
      <TabsContent value="exercises">Exercises</TabsContent>
    </Tabs>
  );
}

export default ExerciseTabs;
