# Copyright 2022, Digi International Inc.
#
# Permission to use, copy, modify, and/or distribute this software for any
# purpose with or without fee is hereby granted, provided that the above
# copyright notice and this permission notice appear in all copies.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
# WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
# MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
# ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
# WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
# ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
# OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

import argparse
import os
import pathlib
import platform
import subprocess
import sys
import venv
import re
import webbrowser

# Constants.
FOLDER_DEMO = "."
FOLDER_VENV = ".venv"
FOLDER_WHEELS = "../digi_wheels"

FILE_REQUIREMENTS = "requirements.txt"
FILE_MANAGE = "manage.py"
FILE_CONFIGURED = ".configured"

PY_VENV_LINUX = "python%d.%d-venv"

PATTERN_SERVER = "^Starting (?:.*)development server at (.*)$"

TWISTED_32 = "Twisted-20.3.0-cp{0}{1}-cp{0}{1}-win32.whl"
TWISTED_64 = "Twisted-20.3.0-cp{0}{1}-cp{0}{1}-win_amd64.whl"

# Variables.
null_output = open(os.devnull, "w")


def create_venv(venv_path):
    """
    Creates a virtual environment in the given path.

    Args:
        venv_path (String): The path of the virtual environment to create.

    Returns:
        :class:`SimpleNamespace`: The context of the virtual environment
            generated. It contains information about the virtual environment
            such as python executable, binaries folder, etc.
    """
    # Verify the virtual environment exists before creating it.
    venv_context = get_venv(venv_path)
    if venv_context is None:
        venv_builder = venv.EnvBuilder(with_pip=True)
        venv_builder.create(venv_path)
        return venv_builder.ensure_directories(venv_path)
    else:
        return venv_context


def get_venv(venv_path):
    """
    Gets the context of the virtual environment located in the given path.

    Args:
        venv_path (String): The path of the virtual environment to get its
            context.

    Returns:
        :class:`SimpleNamespace`: The context of the virtual environment
            of the demo. It contains information about the virtual environment
            such as python executable, binaries folder, etc. `None` if there
            is not a valid environment in that path.
    """
    venv_builder = venv.EnvBuilder(with_pip=True)

    # Get the virtual environment context.
    venv_context = venv_builder.ensure_directories(venv_path)
    if not os.path.exists(venv_context.env_exe):
        return None

    return venv_context


def run_python_cmd(command, enable_debug=True):
    """
    Executes the given command using the installed Python interpreter used to
    run this script.

    Args:
        command (List): The command to execute. Contains the Python file name
            and arguments.
        enable_debug (Boolean): `True` to display the output of the command,
            `False` otherwise.

    Returns:
        Integer: The status code of the execution.
    """
    return subprocess.check_call(command,
                                 stdout=None if enable_debug else null_output,
                                 stderr=None if enable_debug else null_output)


def run_venv_python(venv_context, command, enable_debug=True):
    """
    Executes the given command using the Python interpreter of the virtual
    environment.

    Args:
        venv_context (:class:`SimpleNamespace`): The context of the virtual
            environment.
        command (List): The command to execute. Contains the Python file name
            and arguments.
        enable_debug (Boolean): `True` to display the output of the command,
            `False` otherwise.

    Returns:
        Integer: The status code of the execution.
    """
    command = [venv_context.env_exe] + command
    return subprocess.check_call(command,
                                 stdout=None if enable_debug else null_output,
                                 stderr=None if enable_debug else null_output)


def run_venv_script(venv_context, command, enable_debug=True):
    """
    Executes a a script of the virtual environment.

    Args:
        venv_context (:class:`SimpleNamespace`): The context of the virtual
            environment.
        command (List): The command to execute. Contains the script name
            and arguments.
        enable_debug (Boolean): `True` to display the output of the command,
            `False` otherwise.

    Returns:
        Integer: The status code of the execution.
    """
    # Replace the script with the virtual environment's one.
    command[0] = str(pathlib.Path(venv_context.bin_path).joinpath(command[0]))
    # Execute the command.
    return subprocess.check_call(command,
                                 stdout=None if enable_debug else null_output,
                                 stderr=None if enable_debug else null_output)


def run_web_server(venv_context, command):
    """
    Executes the command to run the WEB server and parser the log to open
    the WEB browser.

    Args:
        venv_context (:class:`SimpleNamespace`): The context of the virtual
            environment.
        command (List): The run WEB server command.
    """
    # Set the PYTHONUNBUFFERED environment variable so when running the script
    # from CLI the URL of the server is printed and thus, opened in the browser.
    env = dict(os.environ, **{'PYTHONUNBUFFERED': '1'})

    command = [venv_context.env_exe, "-u"] + command
    process = subprocess.Popen(command, stdout=subprocess.PIPE,
                               stderr=subprocess.STDOUT, env=env)

    try:
        with process:
            for line in process.stdout:
                if process.poll() is not None:
                    break
                if line:
                    output_text = str(line, "utf-8").rstrip()
                    print(3 * " " + "> " + output_text)
                    sys.stdout.flush()
                    match = re.search(PATTERN_SERVER, output_text)
                    if match:
                        url = match.group(1)
                        webbrowser.open(url, new=2)
    except KeyboardInterrupt:
        process.terminate()
        process.kill()


def is_64_bits_python():
    """
    Returns whether the python architecture is 64 bits or not.

    Returns:
         Boolean: `True` if the python architecture is 64 bits, or `False`
             otherwise.
    """
    return platform.architecture()[0] == "64bit"


def print_success():
    """
    Prints success message.
    """
    print("[OK]")


def print_error(error_message=None):
    """
    Prints success message.
    """
    print("[ERROR]")
    if error_message is not None:
        print("  - %s" % error_message)


def main():
    """
    Main script execution.
    """
    # Get script arguments.
    parser = argparse.ArgumentParser()
    parser.add_argument("-d", "--debug", action='store_true',
                        help="enable debug")
    args = parser.parse_args()
    debug = args.debug

    # Get Python version.
    py_major_version = sys.version_info[0]
    py_minor_version = sys.version_info[1]

    # Print header.
    print(" +-------------------------------+")
    print(" | Digi ConnectCore demo WEB app |")
    print(" +-------------------------------+")
    print("")
    if py_major_version < 3 or py_minor_version < 5:
        print_error("Python 3.5 required to launch this script.")
        sys.exit(-1)
    print(" Please, wait while the script prepares the virtual environment\n"
          " and runs the WEB server...")
    print("")

    # Get the project folders and files.
    print("- Checking project structure... ", end="")
    project_dir = os.path.dirname(os.path.abspath(__file__))
    demo_dir = os.path.join(project_dir, FOLDER_DEMO)
    requirements_file = os.path.join(demo_dir, FILE_REQUIREMENTS)
    manage_file = os.path.join(demo_dir, FILE_MANAGE)
    configured_file = os.path.join(project_dir, FILE_CONFIGURED)
    if not os.path.exists(demo_dir):
        print_error("Could not find the '%s' folder." % FOLDER_DEMO)
        sys.exit(-1)
    if not os.path.exists(requirements_file):
        print_error("Could not find the demo requirements file.")
        sys.exit(-1)
    if not os.path.exists(manage_file):
        print_error("Could not find the '%s' script." % FILE_MANAGE)
        sys.exit(-1)
    configured = os.path.exists(configured_file)
    print_success()

    # Check if the virtual environment exits.
    venv_path = os.path.join(project_dir, FOLDER_VENV)
    venv_context = get_venv(venv_path)
    if venv_context is None:
        configured = False

    # Create the virtual environment.
    if not configured:
        print("- Generating virtual environment... ", end="")
        sys.stdout.flush()
        # If this is a Linux distribution, install the correct venv package for
        # the selected python interpreter.
        if sys.platform == "linux" or sys.platform == "linux2":
            run_python_cmd(["sudo", "apt-get", "--yes", "install",
                            PY_VENV_LINUX % (
                                py_major_version, py_minor_version)])

        venv_context = create_venv(venv_path)
        print_success()

        # Install pip in the virtual environment
        print("- Installing basic modules... ", end="")
        sys.stdout.flush()
        if run_venv_python(venv_context, ['-m', 'pip', 'install', '-U', 'pip'],
                           debug) != 0:
            print_error()
            sys.exit(-1)
        print_success()

        # Install the application requirements.
        print("- Installing application requirements: ")
        with open(requirements_file) as f:
            for line in f:
                line = line.strip()
                if line == "":
                    continue
                print("  - Installing module '%s'... " % line,
                      end="\n" if debug else "")
                sys.stdout.flush()
                if run_venv_script(venv_context, ['pip', 'install', line],
                                   debug) != 0:
                    print_error()
                    sys.exit(-1)
                print_success()

        # Generate the configured mark in the project path.
        open(configured_file, 'a').close()

    # Change working dir.
    os.chdir(demo_dir)

    # Initialize Django database.
    if not configured:
        print("- Initializing Django database... ",
              end="\n" if debug else "")
        sys.stdout.flush()
        if run_venv_python(venv_context, [manage_file, "makemigrations"],
                           debug) != 0:
            print_error("There was an error with the 'makemigrations' "
                        "command.")
            sys.exit(-1)
        if run_venv_python(venv_context, [manage_file, "migrate"], debug) != 0:
            print_error("There was an error with the 'migrate' command.")
            sys.exit(-1)
        print_success()

    # Launch WEB server.
    print("- Running WEB server... ")
    print("")
    sys.stdout.flush()
    run_web_server(venv_context, [manage_file, "runserver"])


if __name__ == '__main__':
    main()
