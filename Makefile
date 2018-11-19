.PHONY: map
map: map/venv
	virtualenv --python=python2.7 map/venv
	curl https://bootstrap.pypa.io/get-pip.py | map/venv/bin/python
	map/venv/bin/pip install -r map/requirements.txt
	map/venv/bin/python map/run.py && cp map/output.png webapp/assets/world_bg.png

map/venv: map/requirements.txt
	virtualenv --python=python2.7 map/venv
	curl https://bootstrap.pypa.io/get-pip.py | map/venv/bin/python
	map/venv/bin/pip install -r map/requirements.txt

.PHONY: data
data: data/venv
	data/venv/bin/python data/sheet_import.py
	cat data/locations.html | pbcopy
	@echo "Location table copied to clipboard."

data/venv: data/requirements.txt
	virtualenv --python=python3 data/venv
	curl https://bootstrap.pypa.io/get-pip.py | data/venv/bin/python
	data/venv/bin/pip install -r data/requirements.txt

.PHONY: clean
clean:
	rm -rf map/venv/ data/venv/
