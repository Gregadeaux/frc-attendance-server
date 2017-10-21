exports.up = (pgm, run) => {
	pgm.addColumns('students', {
		parentnames: 'text',
		parentemails: 'text',
		phonenumber: 'text',
		address: 'text'
	});
	run();
};

exports.down = (pgm, run) => {
	pgm.dropColumns('students', ['parentnames', 'parentemails', 'phonenumber', 'address']);
	run();
};
