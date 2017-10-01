exports.up = (pgm, run) => {
	pgm.createTable('students', {
		id: 'id',
		firstname: 'text',
		lastname: 'text',
		email: 'text',
		grade: 'text',
		gender: 'text'
	});
	run();
};

exports.down = (pgm, run) => {
	pgm.dropTable('students');
	run();
};
