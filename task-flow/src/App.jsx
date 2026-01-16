import Header from './Header'
import TaskList from './TaskList'

function App() {

  const tasks =[
    {
      id: 1,
      title: "dishes",
      description: "It is time to wash the dishes",
      priority: "medium",
      dueDate: "2026-1-15",
      isCompleted: false 
    },
    {
      id: 2,
      title: "clothes",
      description: "It is time to put away the laundry",
      priority: "medium",
      dueDate: "2026-1-17",
      isCompleted: false 
    },
    {
      id: 3,
      title: "food",
      description: "Time to make a yummy meal",
      priority: "low",
      dueDate: "2026-1-15",
      isCompleted: true 
    }
  ]

  return (

    <>
      <Header/>
      <TaskList tasks={tasks}/>
    </>
  )
}

export default App
