import { SKILLS, abilityModifier, formatModifier } from '../utils/dnd5eCalculations.js'

export default function SkillList({ abilityScores, proficientSkills, proficiencyBonus, onToggle }) {
  return (
    <div className="card">
      <span className="eyebrow">Skills</span>
      <div className="ledger-grid" style={{ marginTop: '0.5rem' }}>
        {SKILLS.map((skill) => {
          const isProf = proficientSkills.includes(skill.name)
          const mod = abilityModifier(abilityScores[skill.ability]) + (isProf ? proficiencyBonus : 0)
          return (
            <div className="ledger-row" key={skill.name}>
              <button
                onClick={() => onToggle(skill.name)}
                className="btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'transparent', border: 'none', padding: 0, textAlign: 'left', width: '100%' }}
              >
                <span className={`pill ${isProf ? 'on' : ''}`} style={{ width: 18, height: 18, padding: 0, justifyContent: 'center' }}>
                  {isProf ? '●' : ''}
                </span>
                <span style={{ color: 'var(--parchment)' }}>{skill.name}</span>
                <span style={{ color: 'var(--parchment-dim)', fontSize: '0.78rem' }}>({skill.ability})</span>
              </button>
              <span className="stat-figure" style={{ fontSize: '1rem' }}>{formatModifier(mod)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
                  }
