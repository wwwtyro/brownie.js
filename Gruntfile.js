module.exports = function (grunt) {


	grunt.initConfig({

		concat: {
			src: {
				src: [
					"src/brownie.js",
					"src/geometry-manager.js",
					"src/quad-manager.js",
					"src/voxel-manager.js",
				],
				dest: "build/brownie.js"
			}
		},

		watch: {
			files: "src/*",
			tasks: ["concat:src"]
		}
	});


	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask("default", ["concat:src"]);
};