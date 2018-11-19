#!venv/bin/python
import mapnik
import os

dir_path = os.path.dirname(os.path.realpath(__file__))

stylesheet = dir_path + '/world_style.xml'
image = dir_path + '/output.png'
mapnik.register_fonts('/Library/Fonts/');

#for face in mapnik.FontEngine.face_names(): print face

m = mapnik.Map(1200, 1)
m.aspect_fix_mode = mapnik.aspect_fix_mode.GROW_CANVAS
mapnik.load_map(m, stylesheet)
m.zoom_all()
mapnik.render_to_file(m, image)
print "rendered image to '%s'" % image
