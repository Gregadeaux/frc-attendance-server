exports.up = (pgm, run) => {
	pgm.sql('CREATE TABLE hours (' +
		'"date" date NOT NULL,' +
		'"sid" int NOT NULL REFERENCES students,' +
		'"late" boolean,' +
		'primary key ("date", "sid")' +
		');')
	run();
};

exports.down = (pgm, run) => {
	pgm.dropTable('hours')
	run();
};
