from otree.api import BaseConstants, Currency


# ******************************************************************************************************************** #
# *** CLASS CONSTANTS *** #
# ******************************************************************************************************************** #
class Constants(BaseConstants):

    # oTree Constants
    name_in_url = 'bret'
    players_per_group = None

    # ---------------------------------------------------------------------------------------------------------------- #
    # --- Overall Settings and Appearance --- #
    # ---------------------------------------------------------------------------------------------------------------- #

    # value of single collected box
    # if the bomb is not collected, player's payoff per round is determined by <box_value> times <boxes_collected>
    # note that the currency of any earnings is determined by the oTree settings in settings.py
    # if you set this to a decimal number, you must set POINTS_DECIMAL_PLACES in settings.py
    box_value = Currency(1)

    # number of rows and columns
    # i.e. the total number of boxes is determined by <num_rows> times <num_cols>
    num_rows = 8
    num_cols = 8

    # box height and box width in pixels
    # make sure that the size of the boxes fits the screen of the device
    # note that the layout is responsive, i.e. boxes will break into new rows if they don't fit
    box_height = '50px'
    box_width = '50px'

    # number of rounds to be played
    num_rounds = 5

    # determines whether all rounds played are payed-off or whether one round is randomly chosen for payment
    # if <random_payoff = True>, one round is randomly determined for payment
    # if <random_payoff = False>, the final payoff of the task is the sum of all rounds played
    # note that this is only of interest for the case of <num_rounds> larger than 1
    random_payoff = True

    # if <instructions = True>, a separate template "Instructions.html" is rendered prior to the task in round 1
    # if <instructions = False>, the task starts immediately (e.g. in case of printed instructions)
    instructions = True

    # show feedback by resolving boxes, i.e. toggle boxes and show whether bomb was collected or not
    # if <feedback = True>, the button "Solve" will be rendered and active after game play ends ("Stop")
    # if <feedback = False>, the button "Solve" won't be rendered such that no feedback about game outcome is provided
    feedback = True

    # show results page summarizing the game outcome
    # if <results = True>, a separate page containing all relevant information is displayed after finishing the task
    # if <num_rounds> larger than 1, results are summarized in a table and only shown after all rounds have been played
    results = True


    # ---------------------------------------------------------------------------------------------------------------- #
    # --- Settings Determining Game Play --- #
    # ---------------------------------------------------------------------------------------------------------------- #

    # "dynamic" or "static" game play
    # if <dynamic = True>, one box per time interval is collected automatically
    # in case of <dynamic = True>, game play is affected by the variables <time_interval> and <random> below
    # if <dynamic = False>, subjects collect as many boxes as they want by clicking or entering the respective number
    # in case of <dynamic = False>, game play is affected by the variables <random>, <devils_game> and <undoable>
    dynamic = True

    # time interval between single boxes being collected (in seconds)
    # note that this only affects game play if <dynamic = True>
    time_interval = 1.00

    # collect boxes randomly or systematically
    # if <random = False>, boxes are collected row-wise one-by-one, starting in the top-left corner
    # if <random = True>, boxes are collected randomly (Fisher-Yates Algorithm)
    # note that this affects game play in both cases, <dynamic = True> and <dynamic = False>
    random = True

    # determines whether static game play allows for selecting boxes by clicking or by entering a number
    # if <devils_game = True>, game play is similar to Slovic (1965), i.e. boxes are collected by subjects
    # if <devils_game = False>, subjects enter the number of boxes they want to collect
    # note that this only affects game play if <dynamic = False>
    devils_game = False

    # determine whether boxes can be toggled only once or as often as clicked
    # if <undoable = True> boxes can be selected and de-selected indefinitely often
    # if <undoable = False> boxes can be selected only once (i.e. decisions can not be undone)
    # note that this only affects game play if <dynamic = False> and <devils_game = True>
    undoable = True
