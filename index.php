<!DOCTYPE html>
<html lang="en">
<?php
    if (!isset($_GET['URL'])) {
        $_GET['URL'] = 'https://game2.epam-bot-challenge.com.ua/codenjoy-contest/board/player/tonylovepony@gmail.com?code=528051571629643063';
    }
?>
<head>
    <meta charset="UTF-8">
    <title>Snake</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="snake.js"></script>
    <script>
      URL = '<?=$_GET['URL']?>';
    </script>

    <style>
        .board{
            width: 900px;
            background: url("img/background.png");
            float: left;
        }
        .board-stat{
            float: left;
        }
        .board-stat img{
            vertical-align: middle;
        }
        .board-stat b{
            display: inline-block;
            vertical-align: middle;
        }
        .clear{
            clear: both;
        }
        .row {
            display: flex;
            width: 100%;
        }

        .cell {
            text-align: center;
            height: 30px;
            flex: 1;
            background: url("img/background.png") no-repeat center;
            background-size: contain;
            font-size: 0;
        }

        .cell:before {
            content: '';
            display: inline;
            vertical-align: middle;
            height: 100%;
        }

    </style>
</head>
<body>
<div class="board">
    <?php
        for ($i = 0; $i < 30; $i++) {
            ?>
            <div class="row">
                <?php
                    for ($k = 0; $k < 30; $k++) {
                        ?>
                        <div class="cell" id="c-<?= $i ?>-<?= $k ?>"></div>
                    <?php } ?>
            </div>
        <?php } ?>
</div>
<div class="board-stat">
    <p><img src="img/stone.png" alt="stone"> <b id="stones"></b></p>
</div>
<div class="clear"></div>
<hr>
<form>
    <textarea name="URL" style="width: 100%;margin-bottom: 15px;"><?= $_GET['URL'] ?></textarea>
    <br>
    <button type="submit">Отправить</button>
</form>
</body>
</html>