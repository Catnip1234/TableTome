import { Routes, Route } from 'react-router-dom'
import CharacterSelect from './pages/CharacterSelect.jsx'
import CharacterBuilder from './pages/CharacterBuilder.jsx'
import CharacterSheet from './pages/CharacterSheet.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CharacterSelect />} />
      <Route path="/build/:id" element={<CharacterBuilder />} />
      <Route path="/sheet/:id" element={<CharacterSheet />} />
    </Routes>
  )
}
