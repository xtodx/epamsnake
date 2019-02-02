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
</head>
<body>
    <pre class="board">

    </pre>

    <form>
        <input type="text" name="URL" value="<?= $_GET['URL'] ?>">
        <br>
        <button type="submit">Отправить</button>
    </form>
</body>
</html>