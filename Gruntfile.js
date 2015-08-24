module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
            },
            dist: {
                src: ['src/*.js'],
                dest: 'dist/<%= pkg.name %>.js',
            },
        },

        uglify: {
            options: {
                banner: '// <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n' + '// http://www.nraboy.com\n'
            },
            build: {
                src: ['src/*.js'],
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            all: ['src/*.js']
        },
        clean: {
            js: ['dist/*.min.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('test', ['clean', 'jshint']);
    grunt.registerTask('default', ['clean', 'jshint', 'concat', 'uglify']);

};
