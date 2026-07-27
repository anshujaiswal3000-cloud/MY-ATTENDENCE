import {
  FaBook, FaFlask, FaCode, FaMicrochip, FaProjectDiagram, FaTerminal,
  FaPython, FaCalculator, FaBrain, FaRobot, FaGlobe, FaLaptopCode,
  FaChartLine, FaAtom, FaPuzzlePiece, FaGraduationCap,
} from 'react-icons/fa'

// Central registry: key -> { component, label }
// Used by IconPicker and everywhere a subject icon needs to render.
export const ICON_REGISTRY = {
  book: { Icon: FaBook, label: 'Book' },
  flask: { Icon: FaFlask, label: 'Lab' },
  code: { Icon: FaCode, label: 'Code' },
  chip: { Icon: FaMicrochip, label: 'Circuit' },
  logic: { Icon: FaProjectDiagram, label: 'Logic' },
  terminal: { Icon: FaTerminal, label: 'Terminal' },
  python: { Icon: FaPython, label: 'Python' },
  calc: { Icon: FaCalculator, label: 'Quant' },
  brain: { Icon: FaBrain, label: 'Reasoning' },
  robot: { Icon: FaRobot, label: 'AI' },
  globe: { Icon: FaGlobe, label: 'Web' },
  laptop: { Icon: FaLaptopCode, label: 'Dev' },
  chart: { Icon: FaChartLine, label: 'Analytics' },
  atom: { Icon: FaAtom, label: 'Science' },
  puzzle: { Icon: FaPuzzlePiece, label: 'Logic Puzzle' },
  grad: { Icon: FaGraduationCap, label: 'Academic' },
}

export function getSubjectIcon(key) {
  return ICON_REGISTRY[key]?.Icon || FaBook
}
