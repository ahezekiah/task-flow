import Header from './Header'
import TaskList from './TaskList'

function App() {

  const tasks =[
    {
      id: 1,
      title: "title",
      description: "random",
      priority: "low",
      dueDate: "2026-1-15",
      isCompleted: false 
    },
  ]

  return (

    <>
      <Header/>
      <TaskList tasks={tasks}/>
    </>
  )
}

export default App
