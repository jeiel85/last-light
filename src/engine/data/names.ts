/**
 * Name pools for survivor generation.
 *
 * Deliberately multi-regional and lightly uncommon: the vault is a place strangers ended
 * up, not a village. Given names are stored per pronoun bucket only so that generation can
 * vary the mix; nothing mechanical depends on it.
 */

export const GIVEN_NAMES_A: readonly string[] = [
  'Iris', 'Sela', 'Nadia', 'Rhoda', 'Marit', 'Oksana', 'Yuki', 'Imani', 'Teodora', 'Halina',
  'Petra', 'Amara', 'Signe', 'Rosalind', 'Fenna', 'Zora', 'Mirela', 'Junko', 'Adaeze', 'Ines',
  'Vera', 'Lubna', 'Caitria', 'Solveig', 'Renata', 'Miren', 'Anouk', 'Thandi', 'Elke', 'Noor',
];

export const GIVEN_NAMES_B: readonly string[] = [
  'Doran', 'Kestrel', 'Aurelio', 'Tomas', 'Bekele', 'Ivar', 'Rashid', 'Emeka', 'Casimir', 'Nils',
  'Osman', 'Piotr', 'Hiroshi', 'Dmitri', 'Ansel', 'Malik', 'Ruben', 'Joaquin', 'Bertil', 'Sandor',
  'Ferran', 'Amadou', 'Lorcan', 'Viggo', 'Sunil', 'Marek', 'Idris', 'Gustav', 'Nkosi', 'Elias',
];

export const GIVEN_NAMES_N: readonly string[] = [
  'Ash', 'Wren', 'Vale', 'Rowan', 'Sasha', 'Quill', 'Bay', 'Ellis', 'Marlow', 'Kai',
  'Ari', 'Reme', 'Jun', 'Sol', 'Tam', 'Noa', 'Sabri', 'Lior', 'Adair', 'Ozren',
];

export const SURNAMES: readonly string[] = [
  'Kaminska', 'Ferreira', 'Okonkwo', 'Halloran', 'Bergstrom', 'Nakamura', 'Vasquez', 'Duarte',
  'Petrov', 'Ashworth', 'Ilunga', 'Marchetti', 'Solberg', 'Rahimi', 'Kovac', 'Baptiste',
  'Nwosu', 'Lindqvist', 'Abara', 'Toussaint', 'Ostrowski', 'Whitlock', 'Yilmaz', 'Moreau',
  'Sandoval', 'Bergen', 'Achebe', 'Radich', 'Fontaine', 'Mbeki', 'Larsen', 'Ivanova',
  'Castellan', 'Ngata', 'Roussel', 'Danilova', 'Oyelaran', 'Brennan', 'Sokolov', 'Adeyemi',
  'Kalinen', 'Ruiz', 'Thorne', 'Vukovic', 'Amari', 'Delacroix', 'Nyland', 'Ferrand',
];

/** Callsigns used by radio contacts and unnamed strangers in events. */
export const CALLSIGNS: readonly string[] = [
  'Grey Harbour', 'Nine Pin', 'Ashfield', 'Kestrel Two', 'Old Meridian', 'Bell Tower',
  'Dry Creek', 'The Quarry', 'Northlight', 'Saltbox', 'Hollow Road', 'Pilgrim',
];
