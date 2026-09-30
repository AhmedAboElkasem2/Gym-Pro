// Session-only substitutions keep each choice's work separate, including completed sets.
export function switchChoice(workout, exercise, nextChoice, makeRows) {
  const previous = workout.choiceKeys[exercise.id];
  if (previous === nextChoice.key) return;
  workout.variants ||= {};
  const variants = workout.variants[exercise.id] ||= {};
  variants[previous] = { rows: workout.rows[exercise.id], warm: workout.warm[exercise.id] };
  if (!exercise.choices.some(item => item.key === nextChoice.key)) {
    exercise.choices.push(JSON.parse(JSON.stringify(nextChoice)));
  }
  const restored = variants[nextChoice.key];
  workout.choiceKeys[exercise.id] = nextChoice.key;
  workout.rows[exercise.id] = restored?.rows || makeRows(nextChoice);
  workout.warm[exercise.id] = restored?.warm || [];
  delete variants[nextChoice.key];
  workout.focusCursor = null;
}

export function loggedChoices(workout, exercise) {
  const activeKey = workout.choiceKeys[exercise.id];
  const items = Object.entries(workout.variants?.[exercise.id] || {})
    .map(([key, value]) => ({ key, rows: value.rows }));
  items.push({ key: activeKey, rows: workout.rows[exercise.id] });
  return items.map(item => ({ ...item, choice: exercise.choices.find(c => c.key === item.key) }))
    .filter(item => item.choice);
}

export function focusSets(workout) {
  return workout.r.exercises.flatMap(exercise => workout.rows[exercise.id].map((row, index) => ({
    exerciseId: exercise.id, index, done: row.done
  })));
}

export function focusTarget(workout) {
  const sets = focusSets(workout);
  return sets.find(item => item.exerciseId === workout.focusCursor?.exerciseId && item.index === workout.focusCursor?.index)
    || sets.find(item => !item.done) || sets[sets.length - 1];
}

export function advanceFocus(workout) {
  workout.focusCursor = focusSets(workout).find(item => !item.done) || focusSets(workout).at(-1);
}
